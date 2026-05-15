/** Resolve a user id from a member ref (ObjectId or populated user document). */
export function getMemberUserId(user: unknown): string {
  if (user == null) return "";
  if (typeof user === "string") return user;
  if (typeof user === "object" && user !== null) {
    if ("_id" in user) return String((user as { _id: unknown })._id);
    if ("id" in user) return String((user as { id: unknown }).id);
  }
  return String(user);
}
