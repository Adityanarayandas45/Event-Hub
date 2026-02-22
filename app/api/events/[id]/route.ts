import { readDB,writeDB} from "@/lib/db";
import cloudinary from "@/lib/cloudinary";



export async function GET(
  _req: Request,
  context: { params: { id: string } }
) {
  try {
    const db = readDB();
    const now = new Date();
    const { id } = await Promise.resolve(context.params);
    const event = db.events.find(
      (e) => e.id === id
    );

    if (!event) {
      return new Response(
        JSON.stringify({ message: "Event not found" }),
        { status: 404 }
      );
    }

    const category = db.categories.find(
      (c) => c.id === event.categoryId
    );

    const organizer = db.users.find(
      (u) => u.id === event.organizerId
    );

    const isCompleted =
      new Date(event.eventDate) < now;

    return new Response(
      JSON.stringify({
        ...event,
        status: isCompleted
          ? "completed"
          : event.status,
        categoryName: category?.name,
        organizerName: organizer?.name,
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


export async function PUT(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const db = readDB();
    const formData = await request.formData();
    const { id } = await Promise.resolve(context.params);

    const event = db.events.find((e) => e.id === id);

    if (!event) {
      return new Response(
        JSON.stringify({ message: "Event not found" }),
        { status: 404 }
      );
    }

 
    const organizerId = formData.get("organizerId") as string;

    if (event.organizerId !== organizerId) {
      return new Response(
        JSON.stringify({ message: "Not allowed" }),
        { status: 403 }
      );
    }

    
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const location = formData.get("location") as string;
    const eventDate = formData.get("eventDate") as string;
    const capacityRaw = formData.get("capacity");
    const categoryId = formData.get("categoryId") as string;
    const status = formData.get("status") as string;
    const image = formData.get("image") as File | null;

    const capacity = capacityRaw
      ? Number(capacityRaw)
      : null;

   
    const allowedStatuses = [
      "draft",
      "published",
      "completed",
      "cancelled",
    ];

    if (status && !allowedStatuses.includes(status)) {
      return new Response(
        JSON.stringify({ message: "Invalid status" }),
        { status: 400 }
      );
    }

    
    if (
      categoryId &&
      !db.categories.some((c) => c.id === categoryId)
    ) {
      return new Response(
        JSON.stringify({ message: "Invalid category" }),
        { status: 400 }
      );
    }

 
    if (title && (title.length < 5 || title.length > 200)) {
      return new Response(
        JSON.stringify({ message: "Invalid title" }),
        { status: 400 }
      );
    }


    if (description && description.length < 20) {
      return new Response(
        JSON.stringify({ message: "Description too short" }),
        { status: 400 }
      );
    }

   
    if (eventDate) {
      const selected = new Date(eventDate);
      const today = new Date();

      selected.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);

      if (selected < today) {
        return new Response(
          JSON.stringify({ message: "Date must be future" }),
          { status: 400 }
        );
      }
    }

  
    if (image && image.size > 0) {
      const buffer = Buffer.from(
        await image.arrayBuffer()
      );

      const uploadResult = await new Promise<any>(
        (resolve, reject) => {
          cloudinary.uploader
            .upload_stream(
              { folder: "events" },
              (err, res) => {
                if (err) reject(err);
                else resolve(res);
              }
            )
            .end(buffer);
        }
      );

      event.imageUrl = uploadResult.secure_url;
    }

 
    if (title) event.title = title;
    if (description) event.description = description;
    if (location) event.location = location;
    if (capacity !== null && !isNaN(capacity)) {
      event.capacity = capacity;
    }
    if (eventDate) {
      event.eventDate = new Date(
        eventDate
      ).toISOString();
    }
    if (categoryId) event.categoryId = categoryId;
    if (status) event.status = status;

    event.updatedAt = new Date().toISOString();

    writeDB(db);

    return new Response(
      JSON.stringify({
        message: "Event updated successfully",
        event,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("UPDATE_EVENT_ERROR", error);
    return new Response(
      JSON.stringify({ message: "Internal server error" }),
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  context: { params: { id: string } }
) {
  const db = readDB();
 const {id}= await Promise.resolve(context.params)
  const index = db.events.findIndex((e) => e.id === id);
  if (index === -1) {
    return new Response(
      JSON.stringify({ message: "Event not found" }),
      { status: 404 }
    );
  }

  db.events.splice(index, 1);
  writeDB(db);

  return new Response(
    JSON.stringify({ message: "Event deleted successfully" }),
    { status: 200 }
  );
}
