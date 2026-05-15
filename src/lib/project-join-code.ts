import { randomBytes } from "crypto";
import type { Model } from "mongoose";

const CHARSET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateJoinCode(length = 8): string {
  const bytes = randomBytes(length);
  let code = "";
  for (let i = 0; i < length; i++) {
    code += CHARSET[bytes[i] % CHARSET.length];
  }
  return code;
}

export function normalizeJoinCode(input: string): string {
  return input.trim().toUpperCase().replace(/[\s-]/g, "");
}

export async function generateUniqueJoinCode(
  ProjectModel: Model<{ joinCode?: string }>
): Promise<string> {
  for (let attempt = 0; attempt < 12; attempt++) {
    const code = generateJoinCode();
    const exists = await ProjectModel.exists({ joinCode: code });
    if (!exists) return code;
  }
  throw new Error("Could not generate unique join code");
}

export async function ensureProjectJoinCode(
  project: { _id: unknown; joinCode?: string; save: () => Promise<unknown> },
  ProjectModel: Model<{ joinCode?: string }>
): Promise<string> {
  if (project.joinCode?.trim()) return project.joinCode.trim();
  const code = await generateUniqueJoinCode(ProjectModel);
  project.joinCode = code;
  await project.save();
  return code;
}
