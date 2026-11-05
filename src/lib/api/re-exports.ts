// Re-exports so components can import everything auth-related from "@/lib/api"
// without reaching into client.ts or mock.ts directly.
export { MOCK_DEMO_EMAIL, MOCK_DEMO_PASSWORD } from "./mock";
export {
  validateStudentId,
  validateUniversityEmail,
  validatePassword,
  passwordStrength,
} from "./validation";
