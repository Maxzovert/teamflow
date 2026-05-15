import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { apiSuccess, requireApiAuth } from "@/lib/api-utils";

export async function GET(req: Request) {
  const { error } = await requireApiAuth();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search");

  await connectDB();

  const filter = search
    ? {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      }
    : {};

  const users = await User.find(filter)
    .select("name email avatar role")
    .limit(20);

  return apiSuccess(users);
}
