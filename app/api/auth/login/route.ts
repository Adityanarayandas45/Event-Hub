import { readDB} from "@/lib/db";



export async function POST(request: Request) {
  try {
    const { email, password} = await request.json();
    const db=readDB();
    if (!email || !password ) {
      return new Response(
        JSON.stringify({ message: "Email and password are required" }),
        { status: 400 }
      );
    }

    const user = db.users.find(
      (u) => u.email === email && u.password === password
    );

    if (!user) {
      return new Response(
        JSON.stringify({ message: "Invalid email or password" }),
        { status: 401 }
      );
    }

    if (!user.isEmailVerified) {
      return new Response(
        JSON.stringify({
          message: "Please verify your email before logging in",
        }),
        { status: 403 }
      );
    }
   
    


    return new Response(
      JSON.stringify({
        message: "Login successful",
        
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("LOGIN_ERROR", error);

    return new Response(
      JSON.stringify({ message: "Internal server error" }),
      { status: 500 }
    );
  }
}
