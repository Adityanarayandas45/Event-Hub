"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCallApi } from "../api/hooks/CallApi";
import "@/assets/Common.css";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();

  const [form, setForm] = useState({ email: "", password: "", role: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) return;

    const user = JSON.parse(userStr);

    if (user.role === "organizer") {
      router.replace("/organizer");
    }
    else if (user.role === "attendee") {
      router.replace("/attendee");
    }
  }, [router]);

  const handleSubmit = async (
    e: React.SyntheticEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError("");

    const res = await useCallApi("/api/auth/login", form);

    if (res.success) {

      localStorage.setItem("user", JSON.stringify(res.data.user));
      alert("Login successful");


      if (res.data.user.role === "organizer") {
        router.push("/organizer");
      } else {
        router.push("/attendee");
      }
    } else {
      setError(res.error || "Login failed");
    }

    setLoading(false);
  };

  return (
    <div className="common-wrapper">
      <div className="common-right">
        <h2>Login</h2>

        <form onSubmit={handleSubmit} className="common-form">
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
            required
          />
          <div className="password-wrapper">
            <input
              placeholder="Password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
              required
              className="password-input"
            />

            <span
              className="password-eye"
              onClick={() => setShowPassword(!showPassword)}
            >
              <i
                className={`bi ${showPassword ? "bi-eye" : "bi-eye-slash"
                  }`}
              />
            </span>
          </div>

          <button className="common-btn" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>

          <Link href="/register" className="register-link">
            Register
          </Link>
          <Link href="/forgot-password" className="forgot-link">
            Forgot Password
          </Link>

        </form>

        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>
    </div>
  );
}
