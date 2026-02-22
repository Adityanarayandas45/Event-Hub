"use client";

import { useRouter } from "next/navigation";
import "@/assets/NotFound.css";

interface NotFoundProps {
  title?: string;
  subtitle?: string;
  buttonText?: string;
  redirectPath?: string;
}

export default function NotFoundPage({
  title = "Oops!",
  subtitle = "The page you are looking for might have been removed, had its name changed or is temporarily unavailable.",
  buttonText = "GO TO HOMEPAGE",
  redirectPath = "/",
}: NotFoundProps) {
  const router = useRouter();

  return (
    <div className="notfound-container">
      <h1 className="notfound-title">{title}</h1>

      <h2 className="notfound-code">
        404 - PAGE NOT FOUND
      </h2>

      <p className="notfound-subtitle">
        {subtitle}
      </p>

      <button
        className="notfound-btn"
        onClick={() => router.push(redirectPath)}
      >
        {buttonText}
      </button>
    </div>
  );
}
