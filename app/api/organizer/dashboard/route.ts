import { readDB } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const organizerId = searchParams.get("organizerId");

    if (!organizerId) {
      return new Response(
        JSON.stringify({ message: "Organizer ID is required" }),
        { status: 400 }
      );
    }

    const db = readDB();

    const organizer = db.users.find(
      (u) => u.id === organizerId && u.role === "organizer"
    );

    if (!organizer) {
      return new Response(
        JSON.stringify({ message: "Unauthorized" }),
        { status: 403 }
      );
    }


    const organizerEvents = db.events.filter(
      (event) => event.organizerId === organizerId
    );

    
    const totalEvents = organizerEvents.length;

    const now = new Date();
    const upcomingEvents = organizerEvents.filter(
      (event) =>
        event.status === "published" && event.status !== "completed" &&
        new Date(event.eventDate) > now
    ).length;

    const organizerEventIds = organizerEvents.map((e) => e.id);

    const totalRegistrations = db.registrations.filter((reg) =>
      organizerEventIds.includes(reg.eventId)
    ).length;

    return new Response(
      JSON.stringify({
        totalEvents,
        totalRegistrations,
        upcomingEvents,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("DASHBOARD_STATS_ERROR", error);
    return new Response(
      JSON.stringify({ message: "Internal server error" }),
      { status: 500 }
    );
  }
}
