"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import "@/assets/Common.css";
import "@/assets/CategoryList.css";

type Category = {
  id: string;
  name: string;
};

export default function CategoryListPage() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    axios.get("/api/categories").then((res) => {
      setCategories(res.data);
    });
  }, []);

  return (
    <ProtectedRoute requiredRole="organizer">
      <div className="category-page">
        <h2 className="category-title">Categories</h2>

        <ul className="category-list">
          {categories.map((cat) => (
            <li key={cat.id} className="category-item">
              <span className="category-name">{cat.name}</span>

              <Link href={`/organizer/categories/${cat.id}`}>
                <button className="common-btn category-edit-btn">
                  Select
                </button>
              </Link>
              
            </li>
          ))}
        </ul>
      </div>
    </ProtectedRoute>
  );
}
