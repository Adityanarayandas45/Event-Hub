"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import "@/assets/EditCategory.css";

export default function EditCategoryPage() {
  const { id } = useParams();
  const router = useRouter();

  const [name, setName] = useState("");

  useEffect(() => {
    axios.get("/api/categories").then((res) => {
      const category = res.data.find((c: any) => c.id === id);
      if (category) setName(category.name);
    });
  }, [id]);

  const updateCategory = async () => {
    await axios.put(`/api/categories/${id}`, { name, id });
    alert("Category updated");
    router.push("/organizer/categories");
  };

  const deleteCategory = async () => {
    await axios.delete(`/api/categories/${id}`);
    alert("Category deleted");
    router.push("/organizer/categories");
  };

  return (
    <ProtectedRoute requiredRole="organizer">
      <div className="edit-category-page">
        <h2 className="edit-category-title">Edit Category</h2>

        <input
          className="edit-category-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <div className="edit-category-actions">
          <button
            className="edit-category-btn update-btn"
            onClick={updateCategory}
          >
            Update
          </button>

          <button
            className="edit-category-btn delete-btn"
            onClick={deleteCategory}
          >
            Delete
          </button>
        </div>
      </div>
    </ProtectedRoute>
  );
}
