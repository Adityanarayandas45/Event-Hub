import { readDB } from "@/lib/db";

export async function GET(
  _req: Request,
  context: {params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const db = readDB();

  
    const event = db.events.find((e) => e.id === id);
    if (!event) {
      return new Response(
        JSON.stringify({ message: "Event not found" }),
        { status: 404 }
      );
    }


    const eventRegistrations = db.registrations.filter(
      (r) => r.eventId === id
    );

    const attendees = eventRegistrations.map((reg) => {
      const user = db.users.find((u) => u.id === reg.userId);
      return {
        id: reg.id,
        registeredAt: reg.registeredAt,
        name: user?.name || "Unknown",
        email: user?.email || "Unknown",
      };
    });

    return new Response(
      JSON.stringify({
        total: attendees.length,
        attendees,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("GET_ATTENDEES_ERROR", error);
    return new Response(
      JSON.stringify({ message: "Failed to load attendees" }),
      { status: 500 }
    );
  }
}
