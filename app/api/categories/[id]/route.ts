import { readDB, writeDB } from "@/lib/db";

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { name } = await request.json();
    const db = readDB();

    const { id } = await context.params;

    const category = db.categories.find(
      (c) => c.id === id
    );

    if (!category) {
      return new Response(
        JSON.stringify({ message: "Category not found" }),
        { status: 404 }
      );
    }

    category.name = name;
    writeDB(db);

    return new Response(
      JSON.stringify({
        message: "Category updated successfully",
        category,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("UPDATE_CATEGORY_ERROR", error);

    return new Response(
      JSON.stringify({ message: "Failed to update category" }),
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
){
  try {
    const db = readDB();
    const { id } = await context.params;
    const index = db.categories.findIndex(
      (c) => c.id === id
    );

    if (index === -1) {
      return new Response(
        JSON.stringify({ message: "Category not found" }),
        { status: 404 }
      );
    }

    db.categories.splice(index, 1);
    writeDB(db);

    return new Response(
      JSON.stringify({ message: "Category deleted successfully" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE_CATEGORY_ERROR", error);

    return new Response(
      JSON.stringify({ message: "Failed to delete category" }),
      { status: 500 }
    );
  }
}
