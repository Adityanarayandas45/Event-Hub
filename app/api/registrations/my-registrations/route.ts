import { readDB } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return new Response(
        JSON.stringify({ message: "User ID is required" }),
        { status: 400 }
      );
    }

    const db = readDB();

    const myRegistrations = db.registrations
      .filter(
        (r) =>
          r.userId === userId 
      )
    .map((r) => {
      const event = db.events.find(
        (e) => e.id === r.eventId
      );
      return {
        id: r.id,
        eventId:r.eventId,
        eventTitle: event?.title || "Unknown Event",
        status: r.status || "registered",
        registeredAt: r.registeredAt,
      };
      
    });
  

    return new Response(
      JSON.stringify(myRegistrations),
      { status: 200 }
    );
  } catch (error) {
    console.error("MY_REGISTRATIONS_ERROR", error);

    return new Response(
      JSON.stringify({ message: "Failed to fetch registrations" }),
      { status: 500 }
    );
  }
}
