export interface MentionMember {
  _id: string;
  name: string;
}

/** Find channel member ids referenced with @Name in message text. */
export function findMentionedMemberIds(
  content: string,
  members: MentionMember[]
): string[] {
  const ids = new Set<string>();
  const sorted = [...members].sort((a, b) => b.name.length - a.name.length);

  for (const member of sorted) {
    if (!member.name.trim()) continue;
    const escaped = member.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(`@${escaped}(?=\\s|$|[.,!?;:])`, "i");
    if (pattern.test(content)) {
      ids.add(member._id);
    }
  }

  return [...ids];
}
