import { readDB, writeDB } from "@/lib/db";

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params; 
    const db = readDB();

    const registration = db.registrations.find(
      (r) => r.id === id
    );

    if (!registration) {
      return new Response(
        JSON.stringify({ message: "Registration not found" }),
        { status: 404 }
      );
    }

    if (registration.status === "cancelled") {
      return new Response(
        JSON.stringify({
          message: "Registration already cancelled",
        }),
        { status: 400 }
      );
    }

    const event = db.events.find(
      (e) => e.id === registration.eventId
    );

    if (event) {
      event.registeredCount = Math.max(
        0,
        event.registeredCount - 1
      );
      event.updatedAt = new Date().toISOString();
    }

    registration.status = "cancelled";
    registration.cancelledAt = new Date().toISOString();

    writeDB(db);

    return new Response(
      JSON.stringify({
        message: "Registration cancelled successfully",
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("CANCEL_REGISTRATION_ERROR", error);
    return new Response(
      JSON.stringify({ message: "Internal server error" }),
      { status: 500 }
    );
  }
}
