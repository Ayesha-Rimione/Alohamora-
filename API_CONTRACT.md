# Alohomora! API Contract — v1

**Backend Stack:** Node.js + Express + TypeScript + Prisma + MySQL  
**Base URL:** `http://localhost:5000/api/v1` (dev) | `VITE_API_URL` (frontend env)  
**Authentication:** HttpOnly, SameSite=Lax cookies (`alohomora_session` — 7-day JWT)  
**CORS:** Only `CLIENT_ORIGIN` (e.g. `http://localhost:5173`) with `credentials: include`  
**Error format:**
```json
{ "code": "string", "message": "string", "details"?: [] }
```

---

## 1. Authentication `/auth`

Rate limited: 25 requests per 15 minutes per IP.

### `POST /auth/register`
Creates an unverified student account and logs a 6-digit code to the terminal (dev) or sends email (prod + SMTP configured).

**Request:**
```json
{
  "fullName": "Ayesha Rahman",
  "university": "IUBAT — International University of Business Agriculture and Technology",
  "email": "ayesha.rahman@iubat.edu",
  "studentId": "2210001",
  "password": "StrongPassword123!"
}
```
**Response `201`:** `{ "success": true, "message": "...", "devCode"?: "482910" }`  
**Errors:** `400 validation`, `409 email_taken`, `429 rate_limited`

---

### `POST /auth/verify-email`
Verifies the 6-digit code and sets the session cookie.

**Request:** `{ "email": "...", "code": "482910" }`  
**Response `200`** (sets `Set-Cookie: alohomora_session`):
```json
{ "id": "clxxx", "name": "Ayesha Rahman", "email": "...", "university": "...", "studentId": "2210001", "emailVerified": true }
```

---

### `POST /auth/resend-code`
Regenerates and re-sends the verification code.  
**Request:** `{ "email": "..." }`  **Response `200`:** `{ "success": true }`

---

### `POST /auth/login`
Logs in with email or student ID.

**Request:** `{ "identifier": "ayesha.rahman@iubat.edu", "password": "..." }`  
**Response `200`** (sets cookie): Same user object as verify-email.  
**Errors:** `401 invalid_credentials`, `403 unverified`, `429 rate_limited`

---

### `POST /auth/logout`
Clears session cookie. **Response `200`:** `{ "success": true }`

---

### `POST /auth/forgot-password`
Initiates reset. Always returns success to prevent email enumeration.  
**Request:** `{ "email": "..." }`  **Response `200`:** `{ "success": true }`

---

### `POST /auth/reset-password`
Finalises password reset.  
**Request:** `{ "token": "...", "newPassword": "NewPass123!" }`  
**Response `200`:** `{ "success": true }`

---

### `GET /auth/me`
Returns current authenticated user or `null` if not logged in.  
**Auth:** cookie  **Response `200`:** User object or `null`

---

## 2. User Profile `/me`

### `GET /me`
Returns full student profile with academic details.

**Auth required.**  
**Response `200`:**
```json
{
  "id": "clxxx",
  "name": "Ayesha Rahman",
  "email": "ayesha.rahman@iubat.edu",
  "university": "IUBAT...",
  "studentId": "2210001",
  "degree": "B.Sc. in Computer Science and Engineering",
  "academicYear": "3rd year",
  "semester": "5th semester",
  "weeklyHours": 8,
  "targetRole": "aiml",
  "links": "https://github.com/ayesha-rahman",
  "targetCgpa": 3.65,
  "upcomingCredits": 15,
  "onboarded": true,
  "emailVerified": true
}
```

---

### `PUT /me/profile`
Updates any profile field. Partial updates accepted.  
**Auth required.**  
**Request body:** Any subset of the profile fields above.  
**Response `200`:** Updated profile object.

---

## 3. Onboarding `/onboarding`

### `GET /onboarding`
Returns saved onboarding state (profile, courses, skills). Allows resuming progress.  
**Auth required.**

### `POST /onboarding`
Saves onboarding progress at any step. Send `"finish": true` on completion.  
**Auth required.**  
**Request:**
```json
{
  "step": 2,
  "name": "Ayesha Rahman",
  "degree": "B.Sc. CSE",
  "courses": [{ "code": "CSE111", "name": "Intro", "credits": 3, "grade": "A", "semester": "Term 1" }],
  "skills": { "python": { "level": 4, "evidence": "https://github.com/..." } },
  "finish": false
}
```

---

## 4. Academic Records `/courses`, `/me/cgpa`, `/semesters`

### `GET /courses` — Auth required  
Returns all student courses.

### `POST /courses` — Auth required  
Adds a course.  
**Request:** `{ "code": "CSE331", "name": "Algorithms", "credits": 3, "grade": "A", "semester": "Term 3", "confidence": 4 }`

### `PUT /courses/:id` — Auth required  
Partial update to a course the student owns.

### `DELETE /courses/:id` — Auth required  
Removes a course. Ownership enforced.

### `GET /me/cgpa` — Auth required  
Calculated CGPA + required-grade projection.
```json
{
  "cgpa": 3.66,
  "totalCredits": 17,
  "totalGradePoints": 62.2,
  "courseCount": 6,
  "targetCgpa": 3.65,
  "upcomingCredits": 15,
  "requiredGpaCalculation": {
    "kind": "ok",
    "requiredGpa": 3.63,
    "maxPossibleCgpa": 3.80,
    "totalCredits": 32
  }
}
```

### `POST /me/required-gpa` — Auth required  
Ad-hoc required GPA calculation.  
**Request:** `{ "targetCgpa": 3.75, "upcomingCredits": 18 }`

---

## 5. Career Roles & Skills `/roles`, `/me/skills`, `/me/map`

### `GET /roles` — Public
Lists all 6 career roles with required skill IDs.

### `GET /roles/:id` — Public
Single role with full skill detail.

### `GET /me/skills` — Auth required  
Returns skill ratings map keyed by skill ID.
```json
{
  "python": { "level": 4, "status": "demonstrated", "confidence": 4, "evidence": "...", "evidences": [] },
  "sql":    { "level": 2, "status": "developing",   "confidence": 3, "evidence": "..." }
}
```

### `PUT /me/skills/:skillId` — Auth required  
Updates a skill entry.  
**Request:** `{ "level": 3, "confidence": 3, "evidence": "Built a CLI pipeline" }`

### `POST /me/skills/:skillId/evidence` — Auth required  
Attaches evidence URL to a skill. Note: self-submitted, `verified: false`.  
**Request:** `{ "url": "https://github.com/student/project", "notes": "Deployed on Render" }`  
**Response `201`:** `{ "id": "ev-xxx", "verified": false, "submittedAt": "..." }`

### `DELETE /evidence/:id` — Auth required  
Removes evidence. Ownership enforced.

### `GET /me/map?roleId=aiml` — Auth required  
Full Marauder Map payload. Coverage formula: `Σ(wᵢ × min(aᵢ/rᵢ, 1)) / Σwᵢ × 100`  
**Not a job-offer probability — transparently shows coverage of role requirements only.**

---

## 6. Professor Who? (AI Tutor) `/chat`

Rate limited: 20 messages per minute.

### `POST /chat` — Auth required  
Sends a message. Creates a session automatically if `sessionId` is omitted.
```json
{ "message": "Explain quicksort average complexity", "courseContext": "CSE 331" }
```
**Response `200`:**
```json
{ "sessionId": "sess-xxx", "reply": "Quicksort averages O(n log n)...", "sources": ["lecture7.pdf"] }
```

### `GET /chat/sessions` — Auth required  
Lists the student's own sessions only.

### `POST /chat/sessions` — Auth required  
Creates a named session.  
**Request:** `{ "title": "Algorithms Study", "courseContext": "CSE 331" }`

### `GET /chat/sessions/:sessionId` — Auth required  
Returns session + message history. Ownership enforced.

### `PATCH /chat/sessions/:sessionId` — Auth required  
Renames a session. **Request:** `{ "title": "New name" }`

### `DELETE /chat/sessions/:sessionId` — Auth required  
Deletes session and all messages. Ownership enforced.

---

## 7. Opportunities & Resources `/opportunities`, `/resources`

### `GET /opportunities?type=internship&q=python&page=1&limit=20` — Public  
All listings are marked `"isDemo": true` until a verified data source is connected.

### `GET /resources?price=Free&tag=python` — Public  
Sponsored resources are marked `"isSponsored": true` with `sponsorName` visible.

### `GET /bookmarks` — Auth required  
Returns user's bookmarks.

### `POST /bookmarks` — Auth required  
**Request:** `{ "itemId": "opp-xxx", "itemType": "opportunity" }`

### `DELETE /bookmarks/:id` — Auth required

---

## 8. Deadlines `/me/deadlines`

### `GET /me/deadlines` — Auth required
### `POST /me/deadlines` — Auth required  
**Request:** `{ "title": "Assignment 3", "course": "CSE 331", "date": "2026-11-15", "type": "assignment" }`
### `PATCH /me/deadlines/:id` — Auth required  
### `DELETE /me/deadlines/:id` — Auth required

---

## 9. Learning Plans `/me/plan` (Potion Lab)

### `GET /me/plan?roleId=aiml&hours=8` — Auth required  
Returns (or generates) a weekly study plan. Tasks per week are based on `hoursPerWeek`.

### `PUT /me/plan/settings` — Auth required  
**Request:** `{ "hoursPerWeek": 12, "roleId": "aiml" }`

### `PATCH /me/plan/tasks/:taskId` — Auth required  
**Request:** `{ "done": true }`  **Response:** `{ "id": "...", "done": true }`

---

## 10. Activity `/me/activity`

### `GET /me/activity` — Auth required  
Returns engagement signals — derived from real chat and task data only. No fabricated streaks.
```json
{
  "weeklyHours": 4,
  "streakDays": null,
  "completedQuests": 7,
  "message": "Activity indicators are derived from your actual chat usage and completed plan tasks."
}
```

---

## Error Code Reference

| Code | HTTP | Meaning |
|------|------|---------|
| `validation` | 400 | Zod schema violation |
| `invalid_code` | 400 | Wrong verification code |
| `unauthorized` | 401 | No valid session cookie |
| `invalid_credentials` | 401 | Wrong email/ID or password |
| `unverified` | 403 | Email not yet verified |
| `forbidden` | 403 | Student does not own this resource |
| `not_found` | 404 | Record does not exist |
| `email_taken` | 409 | Email or student ID already registered |
| `conflict` | 409 | Unique constraint violation |
| `rate_limited` | 429 | Too many requests |
| `internal_error` | 500 | Unexpected server error |
