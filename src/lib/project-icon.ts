export const PROJECT_EMOJI_OPTIONS = [
  "📁",
  "🚀",
  "💼",
  "🎨",
  "🔥",
  "⚡",
  "🎯",
  "📊",
  "💡",
  "🛠️",
  "📝",
  "🌟",
  "🏠",
  "👥",
  "💬",
  "🎮",
  "📱",
  "🌈",
  "🎵",
  "📚",
  "🏆",
  "💎",
  "🌿",
  "🐳",
];

export function getProjectDisplayIcon(icon?: string | null): string {
  const trimmed = icon?.trim();
  if (trimmed) return trimmed;
  return "📁";
}
