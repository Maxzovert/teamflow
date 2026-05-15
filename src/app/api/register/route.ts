import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { registerSchema } from "@/lib/validations";
import { apiSuccess, apiError } from "@/lib/api-utils";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message);
    }

    const { name, email, password } = parsed.data;

    await connectDB();

    const existing = await User.findOne({ email });
    if (existing) {
      return apiError("Email already registered", 409);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    return apiSuccess(
      {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
      },
      201
    );
  } catch (err) {
    console.error("[register]", err);
    const message =
      err instanceof Error ? err.message : "Registration failed";
    return apiError(
      process.env.NODE_ENV === "development" ? message : "Registration failed",
      500
    );
  }
}
