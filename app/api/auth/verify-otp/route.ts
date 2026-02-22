import { readDB, writeDB } from "@/lib/db";


export async function POST(request: Request) {
  try {
    const { email, otp } = await request.json();
    const db=readDB();

    if (!email || !otp) {
      return new Response(
        JSON.stringify({ message: "Email and OTP are required" }),
        { status: 400 }
      );
    }

    const user = db.users.find(
      (u) => u.email === email && u.emailOtp === otp
    );

    if (!user) {
      return new Response(
        JSON.stringify({ message: "Invalid OTP" }),
        { status: 400 }
      );
    }

    user.isEmailVerified = true;
    user.emailOtp = undefined;

    // delete user.emailOtp;

    user.updatedAt = new Date();

      writeDB(db);
    return new Response(
      JSON.stringify({ message: "Email verified successfully" }),
      { status: 200 }
    );
  } catch {
    return new Response(
      JSON.stringify({ message: "Internal server error" }),
      { status: 500 }
    );
  }
}
