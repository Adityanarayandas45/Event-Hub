import { readDB, writeDB } from "@/lib/db";
import { UserRole } from "@/lib/store";


const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;


export async function POST(request: Request) {
  try {
    const { name, email, password, role } = await request.json();
    const db = readDB();
    
    if (role === "organizer" && db.users.some(u => u.role === "organizer")) {
      return Response.json(
        { message: "Organizer already exists" },
        { status: 403 }
      );
    }
    if (!name || !email || !password) {
      return new Response(
        JSON.stringify({ message: "All fields are required" }),
        { status: 400 }
      );
    }
    
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ message: "Invalid email address" }),
        { status: 400 }
      );
    }
    
    // if (users.some((u) => u.email === email)) {
    //   return new Response(
    //     JSON.stringify({ message: "Email already exists" }),
    //     { status: 409 }
    //   );
    // }
    
    if (!passwordRegex.test(password)) {
      return new Response(
        JSON.stringify({
          message:
          "Password must be at least 8 characters and include uppercase, lowercase, and a number",
        }),
        { status: 400 }
      );
    }

    // if (!["organizer", "attendee"].includes(role)) {
      //   return new Response(
    //     JSON.stringify({ message: "Invalid role" }),
    //     { status: 400 }
    //   );
    // }

    
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const now = new Date();

    db.users.push( {
      id: String(Date.now()),
      name,
      email,
      password,
      role: role as UserRole,
      isEmailVerified: false,
      emailOtp: otp,
      createdAt: now,
      updatedAt: now,
    });
     writeDB(db)

    
    return new Response(
      JSON.stringify({
        message: "Registration successful. OTP generated.",
     
        otp,
      }),
      { status: 200}
    );
  } catch (error) {
    console.error("REGISTER_ERROR", error);

    return new Response(
      JSON.stringify({ message: "Internal server error" }),
      { status: 500 }
    );
  }
}
