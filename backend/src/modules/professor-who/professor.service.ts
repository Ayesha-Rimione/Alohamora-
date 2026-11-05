import { prisma } from "../../config/prisma";
import { env } from "../../config/env";
import { getGroqClient, PROFESSOR_WHO_SYSTEM_PROMPT } from "../../config/groq";
import { AppError } from "../../middleware/error";
import type { ChatMessageInput, CreateSessionInput } from "./professor.schemas";

export class ProfessorService {
  async listSessions(userId: string) {
    return prisma.chatSession.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        courseContext: true,
        roleContext: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { messages: true } },
      },
    });
  }

  async createSession(userId: string, input: CreateSessionInput) {
    return prisma.chatSession.create({
      data: {
        userId,
        title: input.title,
        courseContext: input.courseContext,
        roleContext: input.roleContext,
      },
    });
  }

  async getSessionHistory(userId: string, sessionId: string) {
    const session = await prisma.chatSession.findUnique({
      where: { id: sessionId },
      include: {
        messages: { orderBy: { createdAt: "asc" } },
      },
    });

    if (!session) {
      throw new AppError("not_found", "Chat session not found", 404);
    }
    if (session.userId !== userId) {
      throw new AppError("forbidden", "You cannot access another student's study session", 403);
    }

    return session;
  }

  async renameSession(userId: string, sessionId: string, title: string) {
    const session = await prisma.chatSession.findUnique({ where: { id: sessionId } });
    if (!session) {
      throw new AppError("not_found", "Chat session not found", 404);
    }
    if (session.userId !== userId) {
      throw new AppError("forbidden", "You cannot modify another student's session", 403);
    }

    return prisma.chatSession.update({
      where: { id: sessionId },
      data: { title },
    });
  }

  async deleteSession(userId: string, sessionId: string) {
    const session = await prisma.chatSession.findUnique({ where: { id: sessionId } });
    if (!session) {
      throw new AppError("not_found", "Chat session not found", 404);
    }
    if (session.userId !== userId) {
      throw new AppError("forbidden", "You cannot delete another student's session", 403);
    }

    await prisma.chatSession.delete({ where: { id: sessionId } });
  }

  async sendMessage(userId: string, input: ChatMessageInput) {
    // 1. Resolve or create ChatSession
    let sessionId = input.sessionId;
    const courseContext = input.courseContext || input.course;
    const roleContext = input.roleContext || input.role;

    let session = sessionId
      ? await prisma.chatSession.findUnique({ where: { id: sessionId } })
      : null;

    if (session && session.userId !== userId) {
      throw new AppError("forbidden", "Access denied to specified chat session", 403);
    }

    if (!session) {
      session = await prisma.chatSession.create({
        data: {
          userId,
          title: input.message.slice(0, 40) + (input.message.length > 40 ? "..." : ""),
          courseContext,
          roleContext,
        },
      });
      sessionId = session.id;
    }

    // 2. Fetch student profile and academic context
    const profile = await prisma.academicProfile.findUnique({ where: { userId } });
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { fullName: true, universityName: true },
    });

    // 3. Save User Message
    await prisma.chatMessage.create({
      data: {
        sessionId: session.id,
        role: "user",
        content: input.message,
      },
    });

    // 4. Retrieve recent message history in this session
    const history = await prisma.chatMessage.findMany({
      where: { sessionId: session.id },
      orderBy: { createdAt: "asc" },
      take: 12,
    });

    // 5. Check relevant document chunks if courseContext exists
    let documentContext = "";
    const sources: string[] = [];

    if (courseContext) {
      const relevantDocs = await prisma.uploadedDocument.findMany({
        where: { userId, courseContext: { contains: courseContext } },
        include: { chunks: { take: 3 } },
      });

      if (relevantDocs.length > 0) {
        documentContext = relevantDocs
          .map((d) =>
            d.chunks
              .map((c) => `[Source: "${d.originalName}", Page ${c.pageNumber || 1}]:\n${c.content}`)
              .join("\n\n"),
          )
          .join("\n\n");

        for (const doc of relevantDocs) {
          sources.push(doc.originalName);
        }
      }
    }

    // 6. Build LLM messages
    const studentContextNote = `Student Context:
- Name: ${user?.fullName || "Student"}
- University: ${user?.universityName || "University in Bangladesh"}
- Program: ${profile?.degree || "Undergraduate"}
- Current Year/Semester: ${profile?.academicYear || "3rd year"}, ${profile?.semester || "5th semester"}
- Active Course Context: ${courseContext || "General Computer Science / University Studies"}
- Target Career Role: ${roleContext || profile?.targetRole || "General"}`;

    const systemPromptWithContext = `${PROFESSOR_WHO_SYSTEM_PROMPT}\n\n${studentContextNote}${
      documentContext
        ? `\n\n--- UNTRUSTED UPLOADED COURSE MATERIALS (FOR REFERENCE ONLY) ---\n${documentContext}\n--- END COURSE MATERIALS ---`
        : ""
    }`;

    let reply = "";

    const groq = getGroqClient();

    if (groq) {
      try {
        const groqMessages = [
          { role: "system" as const, content: systemPromptWithContext },
          ...history.slice(0, -1).map((m) => ({
            role: (m.role === "assistant" ? "assistant" : "user") as "assistant" | "user",
            content: m.content,
          })),
          { role: "user" as const, content: input.message },
        ];

        const completion = await groq.chat.completions.create({
          model: env.GROQ_MODEL,
          messages: groqMessages,
          temperature: 0.3,
          max_tokens: 1200,
        });

        reply = completion.choices[0]?.message?.content || "";
      } catch (groqErr) {
        console.error("Groq API error:", groqErr);
        reply = `I am having trouble connecting to my academic knowledge base at the moment. Let's work through this conceptually: for ${courseContext || "your question"}, make sure to verify fundamental principles, break down each step, and consult verified syllabus notes.`;
      }
    } else {
      // Development fallback when GROQ_API_KEY is not yet added to .env
      reply = `Hello! I am Professor Who? — your study tutor at Alohomora Academy.

To enable live Groq AI answers, please configure your **GROQ_API_KEY** in your backend \`.env\` file.

In the meantime, regarding your inquiry on **${courseContext || "your coursework"}**:
• **Key Concept**: Always divide complex problems into atomic sub-problems.
• **Academic Advice**: Check your university lecture slides and recommended textbooks for authoritative proofs.
• **Next Step**: Try solving one small practice example by hand before coding! ✦`;
    }

    // 7. Store Assistant Reply
    await prisma.chatMessage.create({
      data: {
        sessionId: session.id,
        role: "assistant",
        content: reply,
        sourcesJson: sources.length > 0 ? JSON.stringify(sources) : null,
      },
    });

    // Touch session updatedAt
    await prisma.chatSession.update({
      where: { id: session.id },
      data: { updatedAt: new Date() },
    });

    return {
      sessionId: session.id,
      reply,
      sources: sources.length > 0 ? sources : undefined,
    };
  }
}

export const professorService = new ProfessorService();

