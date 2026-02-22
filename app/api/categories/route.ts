import { readDB, writeDB } from "@/lib/db";

export async function GET() {
  try {
    const db = readDB();

    return new Response(
      JSON.stringify(db.categories),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("GET_CATEGORIES_ERROR", error);

    return new Response(
      JSON.stringify({ message: "Failed to fetch categories" }),
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { name } = await request.json();
    const db = readDB();
     
    if (!name) {
      return new Response(
        JSON.stringify({ message: "Category name is required" }),
        { status: 400 }
      );
    }

    const exists = db.categories.find(
      (c: any) => c.name.toLowerCase() === name.toLowerCase()
    );

    if (exists) {
      return new Response(
        JSON.stringify({ message: "Category already exists" }),
        { status: 409 }
      );
    }

    const newCategory = {
      id: (db.categories.length + 1).toString(), 
      name,
      description: "",
      createdAt: new Date().toISOString(),
    };

    db.categories.push(newCategory);
    writeDB(db);

    return new Response(
      JSON.stringify(newCategory),
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE_CATEGORY_ERROR", error);

    return new Response(
      JSON.stringify({ message: "Failed to create category" }),
      { status: 500 }
    );
  }
}
