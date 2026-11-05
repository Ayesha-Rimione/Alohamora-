// The single API surface for the whole app.
//
// VITE_USE_MOCK_API=true (default while backend doesn't exist) -> mock
// adapter with in-memory persistence and realistic demo data.
// VITE_USE_MOCK_API=false -> real HTTP client that talks to the Node.js + MySQL
// backend with an httpOnly session cookie (credentials: "include").
// Both implement the identical AlohomoraApi interface.

import { realApi } from "./client";
import { mockApi } from "./mock";
import type { AlohomoraApi } from "./types";

export const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API !== "false";

export const api: AlohomoraApi = USE_MOCK_API ? mockApi : realApi;

export * from "./types";
export {
  MOCK_DEMO_EMAIL,
  MOCK_DEMO_PASSWORD,
  peekMockCode,
  mockUniversityLabel,
} from "./mock";
export {
  validateStudentId,
  validateUniversityEmail,
  validatePassword,
  passwordStrength,
} from "./validation";
