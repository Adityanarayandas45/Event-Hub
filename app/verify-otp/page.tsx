"use client";

import { useEffect, useState } from "react";
import { useCallApi } from "../api/hooks/CallApi";
import { useRouter } from "next/navigation";
import "@/assets/Common.css"

export default function VerifyOtpPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    otp: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const savedEmail = localStorage.getItem("verifyEmail");
    if (savedEmail) {
      setForm((prev) => ({
        ...prev,
        email: savedEmail,
      }));
    }
  }, []);

  const handleSubmit = async (
    e: React.SyntheticEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError("");

    const res = await useCallApi(
      "/api/auth/verify-otp",
      form
    );

    if (res.success) {
      
      const password =
        localStorage.getItem("tempPassword");

      if (!password) {
        setError("Session expired. Please login.");
        setLoading(false);
        return;
      }

     
      const loginRes = await useCallApi(
        "/api/auth/login",
        {
          email: form.email,
          password: password,
        }
      );

      if (loginRes.success) {
     
        localStorage.setItem(
          "user",
          JSON.stringify(loginRes.data.user)
        );


        localStorage.removeItem("tempPassword");
        localStorage.removeItem("verifyEmail");

        if (loginRes.data.user.role === "organizer") {
          router.replace("/organizer");
        } else {
          router.replace("/attendee");
        }
      } else {
        setError("Auto login failed");
      }
    } else {
      setError(res.error || "Invalid OTP");
    }

    setLoading(false);
  };

  return (
    <div className="common-wrapper">
      <div className="common-right">
        <h2>Verify Email</h2>

        <form
          onSubmit={handleSubmit}
          className="common-form"
        >
          {/* <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) =>
              setForm({
                ...form,
                email: e.target.value,
              })
            }
            required
          /> */}

          <input
            type="text"
            placeholder="Enter OTP"
            value={form.otp}
            onChange={(e) =>
              setForm({
                ...form,
                otp: e.target.value,
              })
            }
            required
          />

          <button disabled={loading} className="common-btn">
            {loading
              ? "Verifying..."
              : "Verify & Login"}
          </button>
        </form>

        {error && (
          <p style={{ color: "red" }}>
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
