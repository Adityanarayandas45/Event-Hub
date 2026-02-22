import { readDB, writeDB } from "@/lib/db";


export async function POST(request: Request) {
  try {
    const { email } = await request.json();
      const db=readDB();
    if (!email) {
      return new Response(
        JSON.stringify({ message: "Email is required" }),
        { status: 400 }
      );
    }

    const user = db.users.find((u) => u.email === email);

    if (!user) {
      return new Response(
        JSON.stringify({ message: "User not found" }),
        { status: 404 }
      );
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.emailOtp = otp;
    user.updatedAt = new Date();
    
    writeDB(db);

    return new Response(
      JSON.stringify({
        message: "OTP generated",
        otp, 
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
