import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { profileUpdateSchema } from "@/lib/validations";
import { apiSuccess, apiError, requireApiAuth } from "@/lib/api-utils";

export async function GET() {
  const { user, error } = await requireApiAuth();
  if (error) return error;

  await connectDB();

  const profile = await User.findById(user!.id).select(
    "name email role avatar designation createdAt"
  );

  if (!profile) return apiError("User not found", 404);

  return apiSuccess(profile);
}

export async function PATCH(req: Request) {
  const { user, error } = await requireApiAuth();
  if (error) return error;

  try {
    const body = await req.json();
    const parsed = profileUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message);
    }

    await connectDB();

    const updated = await User.findByIdAndUpdate(
      user!.id,
      { $set: parsed.data },
      { new: true, runValidators: true }
    ).select("name email role avatar designation");

    if (!updated) return apiError("User not found", 404);

    return apiSuccess(updated);
  } catch {
    return apiError("Failed to update profile", 500);
  }
}
