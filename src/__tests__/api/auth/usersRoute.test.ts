/**
 * POST /api/auth/users — route tests
 *
 * Verifies the HTTP behavior of the user-registration route.
 * AuthService and bcrypt are mocked — no database access occurs.
 *
 * Input contract: JSON body with { name, email, password }
 * Output contracts:
 *   201  — user created; returns sanitized user (no passwordHash)
 *   400  — invalid request body
 *   409  — name or email already taken
 *   500  — unexpected service error
 */

import { POST } from "@/app/api/auth/users/route";

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock("@/services/AuthService", () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock("bcrypt", () => ({
  hash: jest.fn().mockResolvedValue("$2b$10$mockedHash"),
}));

// ─── Mock accessors ───────────────────────────────────────────────────────────

import signUp from "@/services/AuthService";

const signUpMock = signUp as jest.Mock;

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const CREATED_USER = {
  id: "550e8400-e29b-41d4-a716-446655440001",
  name: "alice",
  email: "alice@example.com",
  passwordHash: "$2b$10$mockedHash",
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};

/** Returns a Request with JSON body. */
function makeRequest(body: unknown): Request {
  return new Request("http://localhost/api/auth/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("POST /api/auth/users", () => {
  describe("with a valid { name, email, password } body", () => {
    it("responds 201 with the created user (no passwordHash)", async () => {
      signUpMock.mockResolvedValue(CREATED_USER);

      const response = await POST(
        makeRequest({ name: "alice", email: "alice@example.com", password: "secret123" }),
      );
      const body = await response.json();

      expect(response.status).toBe(201);
      expect(body.data).toBeDefined();
      expect(body.data.id).toBe(CREATED_USER.id);
      expect(body.data.email).toBe(CREATED_USER.email);
      expect(body.data.name).toBe(CREATED_USER.name);
      // Password hash must never be returned.
      expect(body.data.passwordHash).toBeUndefined();
    });
  });

  describe("with an invalid email address", () => {
    it("responds 400", async () => {
      const response = await POST(
        makeRequest({ name: "alice", email: "not-an-email", password: "secret123" }),
      );

      expect(response.status).toBe(400);
      expect(signUpMock).not.toHaveBeenCalled();
    });
  });

  describe("with a password that is too short (< 6 characters)", () => {
    it("responds 400", async () => {
      const response = await POST(
        makeRequest({ name: "alice", email: "alice@example.com", password: "abc" }),
      );

      expect(response.status).toBe(400);
      expect(signUpMock).not.toHaveBeenCalled();
    });
  });

  describe("with a name that is too short (< 4 characters)", () => {
    it("responds 400", async () => {
      const response = await POST(
        makeRequest({ name: "ali", email: "alice@example.com", password: "secret123" }),
      );

      expect(response.status).toBe(400);
      expect(signUpMock).not.toHaveBeenCalled();
    });
  });

  describe("with missing required fields", () => {
    it("responds 400 when name is absent", async () => {
      const response = await POST(
        makeRequest({ email: "alice@example.com", password: "secret123" }),
      );

      expect(response.status).toBe(400);
    });

    it("responds 400 when email is absent", async () => {
      const response = await POST(
        makeRequest({ name: "alice", password: "secret123" }),
      );

      expect(response.status).toBe(400);
    });
  });

  describe("when the name or email is already taken", () => {
    it("responds 409", async () => {
      signUpMock.mockResolvedValue(null);

      const response = await POST(
        makeRequest({ name: "alice", email: "alice@example.com", password: "secret123" }),
      );
      const body = await response.json();

      expect(response.status).toBe(409);
      expect(body.message).toMatch(/already exists/i);
    });
  });

  describe("when the service throws an unexpected error", () => {
    it("responds 500", async () => {
      signUpMock.mockRejectedValue(new Error("database unreachable"));

      const response = await POST(
        makeRequest({ name: "alice", email: "alice@example.com", password: "secret123" }),
      );

      expect(response.status).toBe(500);
    });
  });
});
