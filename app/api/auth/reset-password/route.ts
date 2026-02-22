import { readDB, writeDB } from "@/lib/db";


const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export async function POST(request: Request) {
  try {
    const { email, otp, password, confirmPassword } =
      await request.json();
          const db=readDB();
    if (!email || !otp || !password || !confirmPassword) {
      return new Response(
        JSON.stringify({ message: "All fields are required" }),
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return new Response(
        JSON.stringify({ message: "Passwords do not match" }),
        { status: 400 }
      );
    }

    if (!passwordRegex.test(password)) {
      return new Response(
        JSON.stringify({
          message:
            "Password must be at least 8 characters and include uppercase, lowercase, and a number",
        }),
        { status: 400 }
      );
    }

    const user = db.users.find(
      (u) => u.email === email && u.emailOtp === String(otp).trim()
    );

    if (!user) {
      return new Response(
        JSON.stringify({ message: "Invalid OTP" }),
        { status: 400 }
      );
    }

    user.password = password;
    user.emailOtp = undefined;
    user.updatedAt = new Date();
    
    writeDB(db);

    return new Response(
      JSON.stringify({
        message: "Password reset successfully",
      }),
      { status: 200 }
    );
  } catch {
    return new Response(
      JSON.stringify({ message: "Internal server error" }),
      { status: 500 }
    );
  }
}
