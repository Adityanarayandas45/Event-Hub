"use client";

import { useState } from "react";
import emailjs from "@emailjs/browser";
import { useCallApi } from "../api/hooks/CallApi";
import { useRouter } from "next/navigation";
import "@/assets/Common.css";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setMessage("");
    setError("");

    const res = await useCallApi("/api/auth/forgot-password", { email });

    if (!res.success) {
      setError(res.error || "Something went wrong");
      setLoading(false);
      return;
    }

    try {
   
      await emailjs.send(
        "service_ipvtqrk",     
        "template_8qeqil7",     
        {
          email,
          otp: res.data.otp,   
        },
        "a6I2mKdYOJV6Wlc72"     
      );

   
      localStorage.setItem(
        "resetEmail",
        email
      );

      setMessage("OTP sent to your email");
      setTimeout(() => {
        router.push("/reset-password");
      }, 1500);
    } catch (err) {
      console.error("EMAILJS_ERROR", err);
      setError("Failed to send OTP email");
    }

    setLoading(false);
  };

  return (
    <div className="common-wrapper">
        <div className="common-right">
      <h2>Forgot Password</h2>
      <h3>Enter your registered email</h3>

      <form onSubmit={handleSubmit} className="common-form">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button className="common-btn" disabled={loading}>
          {loading ? "Sending..." : "Send OTP"}
        </button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {message && <p style={{ color: "green" }}>{message}</p>}
    </div>
    </div>
  );
}
