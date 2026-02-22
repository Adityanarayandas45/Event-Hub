import { readDB } from "@/lib/db";

export async function GET() {
  const db = readDB();


  const organizer = db.users.find((u) => u.role === "organizer");

  if (!organizer) {
    return new Response(JSON.stringify([]), { status: 200 });
  }

 
  const organizerEvents = db.events.filter(
    (e) => e.organizerId === organizer.id
  );


  const attendees = db.registrations
    .filter((r) =>
      organizerEvents.some((e) => e.id === r.eventId)
    )
    .map((r) => {
      const user = db.users.find((u) => u.id === r.userId);
      const event = db.events.find((e) => e.id === r.eventId);

      return {
        id: r.id,
        attendeeName: user?.name ?? "Unknown",
        attendeeEmail: user?.email ?? "Unknown",
        eventTitle: event?.title ?? "Unknown",
        status: r.status,
        registeredAt: r.registeredAt,
      };
    });

  return new Response(JSON.stringify(attendees), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
