import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { apiSuccess, apiError, requireApiAuth } from "@/lib/api-utils";

export async function POST(req: Request) {
  const { error } = await requireApiAuth();
  if (error) return error;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) return apiError("No file provided");

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) return apiError("File too large (max 5MB)");

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const filePath = path.join(uploadDir, safeName);
    await writeFile(filePath, buffer);

    return apiSuccess({
      name: file.name,
      url: `/uploads/${safeName}`,
      type: file.type,
      size: file.size,
    });
  } catch {
    return apiError("Upload failed", 500);
  }
}
