/**
 * AuthService tests
 *
 * Tests the signUp service function behavior.
 * All database access is mocked — only input/output contracts are verified.
 */

import signUp from "@/services/AuthService";

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: {
    user: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  },
}));

// Provide just enough from @/generated/prisma for the service to run.
jest.mock("@/generated/prisma", () => {
  class PrismaClientKnownRequestError extends Error {
    code: string;
    constructor(message: string, { code }: { code: string }) {
      super(message);
      this.name = "PrismaClientKnownRequestError";
      this.code = code;
    }
  }
  return {
    Prisma: { PrismaClientKnownRequestError },
  };
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

import prisma from "@/lib/prisma";
import { Prisma } from "@/generated/prisma";

const findFirstMock = prisma.user.findFirst as jest.Mock;
const createMock = prisma.user.create as jest.Mock;

/** A valid, complete user payload that satisfies the UserPayload type. */
const validPayload = {
  name: "alice",
  email: "alice@example.com",
  passwordHash: "$2b$10$hashedpassword",
};

/** What a Prisma-returned User row looks like. */
const dbUser = {
  id: "550e8400-e29b-41d4-a716-446655440001",
  name: "alice",
  email: "alice@example.com",
  passwordHash: "$2b$10$hashedpassword",
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("signUp", () => {
  describe("given a unique name and email", () => {
    it("returns the created User record", async () => {
      findFirstMock.mockResolvedValue(null);
      createMock.mockResolvedValue(dbUser);

      const result = await signUp(validPayload);

      expect(result).not.toBeNull();
      expect(result?.id).toBe(dbUser.id);
      expect(result?.name).toBe(validPayload.name);
      expect(result?.email).toBe(validPayload.email);
    });

    it("stores the provided passwordHash without further transformation", async () => {
      findFirstMock.mockResolvedValue(null);
      createMock.mockResolvedValue(dbUser);

      const result = await signUp(validPayload);

      expect(createMock).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            passwordHash: validPayload.passwordHash,
          }),
        }),
      );
      expect(result).not.toBeNull();
    });
  });

  describe("given a conflicting name", () => {
    it("returns null without creating a user", async () => {
      findFirstMock.mockResolvedValue({ ...dbUser, name: validPayload.name });

      const result = await signUp(validPayload);

      expect(result).toBeNull();
      expect(createMock).not.toHaveBeenCalled();
    });
  });

  describe("given a conflicting email", () => {
    it("returns null without creating a user", async () => {
      findFirstMock.mockResolvedValue({ ...dbUser, email: validPayload.email });

      const result = await signUp(validPayload);

      expect(result).toBeNull();
      expect(createMock).not.toHaveBeenCalled();
    });
  });

  describe("when Prisma raises a P2002 unique-constraint error", () => {
    it("returns null instead of propagating the error", async () => {
      findFirstMock.mockResolvedValue(null);
      createMock.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
          code: "P2002",
        }),
      );

      const result = await signUp(validPayload);

      expect(result).toBeNull();
    });
  });

  describe("when Prisma raises an unexpected error", () => {
    it("re-throws the error", async () => {
      findFirstMock.mockResolvedValue(null);
      createMock.mockRejectedValue(new Error("connection refused"));

      await expect(signUp(validPayload)).rejects.toThrow("connection refused");
    });
  });
});
