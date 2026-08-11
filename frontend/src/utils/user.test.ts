import { describe, expect, it } from "vitest";
import { getUserDisplayName } from "./user";

describe("getUserDisplayName", () => {
  it("returns User when user is null", () => {
    expect(getUserDisplayName(null)).toBe("User");
  });

  it("prefers name over first and last name", () => {
    expect(
      getUserDisplayName({
        name: "Display Name",
        firstName: "First",
        lastName: "Last",
      })
    ).toBe("Display Name");
  });

  it("falls back to first and last name", () => {
    expect(
      getUserDisplayName({
        firstName: "Jane",
        lastName: "Doe",
      })
    ).toBe("Jane Doe");
  });
});
