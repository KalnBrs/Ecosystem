import { isStrongPassword, PASSWORD_MAX_LENGTH } from "@/lib/passwordRules";

describe("isStrongPassword", () => {
  it("accepts a password meeting every rule", () => {
    expect(isStrongPassword("Secret#12345")).toBe(true);
  });

  it.each([
    ["shorter than 10 characters", "Aa1!aaaa"],
    ["missing a lowercase letter", "SECRET#12345"],
    ["missing an uppercase letter", "secret#12345"],
    ["missing a number", "Secret#abcdef"],
    ["missing a symbol", "Secret123456"],
    ["containing whitespace", "Secret #12345"],
  ])("rejects a password %s", (_label, password) => {
    expect(isStrongPassword(password)).toBe(false);
  });

  it("rejects a password longer than the bcrypt limit", () => {
    expect(isStrongPassword("Aa1!" + "a".repeat(PASSWORD_MAX_LENGTH))).toBe(false);
  });
});
