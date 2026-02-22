import cloudinary from "@/lib/cloudinary";
import { readDB, writeDB } from "@/lib/db";
import { EventStatus } from "@/lib/store";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const db = readDB();

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const location = formData.get("location") as string;
    const eventDate = formData.get("eventDate") as string;
    const capacity = Number(formData.get("capacity"));
    const status = formData.get("status") as EventStatus;
    const categoryId = formData.get("categoryId") as string;
    const organizerId = formData.get("organizerId") as string;
    const image = formData.get("image") as File | null;

    const allowedStatuses: EventStatus[] = [
      "draft",
      "published",
      "cancelled",
      "completed",
    ];

    if (!status || !allowedStatuses.includes(status)) {
      return new Response(
        JSON.stringify({ message: "Invalid event status" }),
        { status: 400 }
      );
    }

    const organizer = db.users.find(
      (u) => u.id === organizerId && u.role === "organizer"
    );

    if (!organizer) {
      return new Response(
        JSON.stringify({ message: "Only organizers can create events" }),
        { status: 403 }
      );
    }

    if (!title || title.length < 5 || title.length > 200) {
      return new Response(
        JSON.stringify({ message: "Title must be 5–200 characters" }),
        { status: 400 }
      );
    }

    if (!description || description.length < 20) {
      return new Response(
        JSON.stringify({
          message: "Description must be at least 20 characters",
        }),
        { status: 400 }
      );
    }

    if (!location) {
      return new Response(
        JSON.stringify({ message: "Location is required" }),
        { status: 400 }
      );
    }

    const parsedDate = new Date(eventDate);
    if (isNaN(parsedDate.getTime()) || parsedDate <= new Date()) {
      return new Response(
        JSON.stringify({
          message: "Event date must be in the future",
        }),
        { status: 400 }
      );
    }

    if (!capacity || capacity < 1) {
      return new Response(
        JSON.stringify({
          message: "Capacity must be at least 1",
        }),
        { status: 400 }
      );
    }

    if (!db.categories.some((c) => c.id === categoryId)) {
      return new Response(
        JSON.stringify({ message: "Invalid category" }),
        { status: 400 }
      );
    }

    let imageUrl: string | null = null;

    if (image) {
      const buffer = Buffer.from(await image.arrayBuffer());

      const uploadResult = await new Promise<any>((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            { folder: "events", resource_type: "image" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          )
          .end(buffer);
      });

      imageUrl = uploadResult.secure_url;
    }

    const now = new Date().toISOString();

    const newEvent = {
      id: Date.now().toString(),
      organizerId,
      categoryId,
      title,
      description,
      location,
      eventDate: parsedDate.toISOString(),
      capacity,
      registeredCount: 0,
      status,
      imageUrl,
      createdAt: now,
      updatedAt: now,
    };

    db.events.push(newEvent);
    writeDB(db);

    return new Response(
      JSON.stringify({
        message: "Event created successfully",
        event: newEvent,
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error("EVENT_CREATE_ERROR", error);
    return new Response(
      JSON.stringify({ message: "Internal server error" }),
      { status: 500 }
    );
  }
}




export async function GET() {
  try {
    const db = readDB();
    const now = new Date();

    const allEvents = db.events.map((event) => {
      const category = db.categories.find(
        (c) => c.id === event.categoryId
      );

      const organizer = db.users.find(
        (u) => u.id === event.organizerId
      );

      const isCompleted =
        new Date(event.eventDate) < now;

      return {
        ...event,
        status: isCompleted
          ? "completed"
          : event.status,
        categoryName: category?.name || "Unknown",
        organizerName: organizer?.name || "Unknown",
      };
    });

    return new Response(
      JSON.stringify(allEvents),
      { status: 200 }
    );
  } catch (error) {
    console.error("GET_EVENTS_ERROR", error);

    return new Response(
      JSON.stringify({
        message: "Failed to fetch events",
      }),
      { status: 500 }
    );
  }
}

