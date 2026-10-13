import { POST } from "@/app/api/auth/recover-password/route";

jest.mock("@/services/AuthService", () => ({
  __esModule: true,
  default: jest.fn(),
  resetPassword: jest.fn(),
}));

jest.mock("bcrypt", () => ({
  hash: jest.fn().mockResolvedValue("$2b$10$mockedHash"),
}));

import { resetPassword } from "@/services/AuthService";

const resetPasswordMock = resetPassword as jest.Mock;
const env = process.env as Record<string, string | undefined>;
const originalNodeEnv = env.NODE_ENV;

function makeRequest(body: unknown): Request {
  return new Request("http://localhost/api/auth/recover-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

afterEach(() => {
  env.NODE_ENV = originalNodeEnv;
  jest.clearAllMocks();
});

describe("POST /api/auth/recover-password", () => {
  it("resets the password and responds 200 outside production", async () => {
    resetPasswordMock.mockResolvedValue(true);

    const response = await POST(makeRequest({ email: "alice@example.com", password: "Secret#12345" }));

    expect(response.status).toBe(200);
    expect(resetPasswordMock).toHaveBeenCalledWith("alice@example.com", "$2b$10$mockedHash");
  });

  it("responds 404 when no account has the email", async () => {
    resetPasswordMock.mockResolvedValue(false);

    const response = await POST(makeRequest({ email: "nobody@example.com", password: "Secret#12345" }));

    expect(response.status).toBe(404);
  });

  it("responds 400 for a weak password", async () => {
    const response = await POST(makeRequest({ email: "alice@example.com", password: "weak" }));

    expect(response.status).toBe(400);
    expect(resetPasswordMock).not.toHaveBeenCalled();
  });

  it("responds 404 and does nothing in production", async () => {
    env.NODE_ENV = "production";

    const response = await POST(makeRequest({ email: "alice@example.com", password: "Secret#12345" }));

    expect(response.status).toBe(404);
    expect(resetPasswordMock).not.toHaveBeenCalled();
  });
});
