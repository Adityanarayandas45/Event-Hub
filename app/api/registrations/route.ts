import { readDB, writeDB } from "@/lib/db"

export async function POST(request: Request){
 
try
{
   const {eventId,userId}= await request.json()
   const db=readDB();
   const user =db.users.find((u)=>u.id===userId)

 if(!user){
    return new Response(
        JSON.stringify({message:"user not found"}),
        {
             status:404
        }
    )
 }
    const event=db.events.find((u)=>u.id===eventId)
    if (!event) {
        return new Response(
          JSON.stringify({ message: "Event not found" }),
          { status: 404 }
        );
      }
      if (event.status !== "published") {
        return new Response(
          JSON.stringify({ message: "Event is not open for registration" }),
          { status: 400 }
        );
      }
  
      if (event.registeredCount >= event.capacity) {
        return new Response(
          JSON.stringify({ message: "Event is fully booked" }),
          { status: 400 }
        );
      }
      const alreadyRegistered = db.registrations.some(
        (r) =>
          r.eventId === eventId &&
          r.userId === userId &&
          r.status === "registered"
      );
      
  
      if (alreadyRegistered) {
        return new Response(
          JSON.stringify({ message: "You are already registered for this event" }),
          { status: 409 }
        );
      }
  


 const newRegistration = {
    id: Date.now().toString(),
    eventId,
    userId,
    status:"registered",
    registeredAt: new Date(),
 }
    db.registrations.push(newRegistration);
    writeDB(db);

    event.registeredCount += 1;
    event.updatedAt = new Date();

    writeDB(db);

    return new Response(
      JSON.stringify({
        message: "Successfully registered for event",
        registration: newRegistration,
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error("EVENT_REGISTRATION_ERROR", error);

    return new Response(
      JSON.stringify({ message: "Internal server error" }),
      { status: 500 }
    );
  }
}

