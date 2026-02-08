/**
 * Returns the display name for a user.
 * Prioritizes the 'name' field, fallbacks to 'firstName' and 'lastName'.
 */
export const getUserDisplayName = (user: {
    name?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
} | null | undefined): string => {
    if (!user) return "User";

    if (user.name) {
        return user.name;
    }

    const firstName = user.firstName || "";
    const lastName = user.lastName || "";
    const fullName = `${firstName} ${lastName}`.trim();

    return fullName || user.email || "User";
};
