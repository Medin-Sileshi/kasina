export function unwrapAuthUser(result: unknown): {
  userId: string;
  headers: Headers | null;
} {
  if (result && typeof result === "object") {
    if (
      "response" in result &&
      result.response &&
      typeof result.response === "object" &&
      "user" in result.response &&
      result.response.user &&
      typeof result.response.user === "object" &&
      "id" in result.response.user
    ) {
      return {
        userId: String(result.response.user.id),
        headers:
          "headers" in result && result.headers instanceof Headers
            ? result.headers
            : null,
      };
    }
    if ("user" in result && result.user && typeof result.user === "object" && "id" in result.user) {
      return {
        userId: String(result.user.id),
        headers:
          "headers" in result && result.headers instanceof Headers
            ? result.headers
            : null,
      };
    }
  }
  throw new Error("Could not resolve user from auth response");
}
