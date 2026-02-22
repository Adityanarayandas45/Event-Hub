"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCallApi } from "../api/hooks/CallApi";
import "@/assets/Common.css";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    otp: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem("resetEmail");
    if (savedEmail) {
      setForm((prev) => ({ ...prev, email: savedEmail }));
    }
  }, []);

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    const res = await useCallApi("/api/auth/reset-password", form);

    if (res.success) {
      setSuccess("Password reset successfully");
      localStorage.removeItem("resetEmail");

      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } else {
      setError(res.error || "Invalid OTP");
    }

    setLoading(false);
  };

  return (
    <div className="common-wrapper">
      <div className="common-right">
        <h2>Reset Password</h2>
        <h3>Enter OTP and your new password</h3>

        <form onSubmit={handleSubmit} className="common-form">
          <input
            type="text"
            placeholder="OTP"
            value={form.otp}
            onChange={(e) =>
              setForm({ ...form, otp: e.target.value })
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
                className={`bi ${
                  showPassword ? "bi-eye" : "bi-eye-slash"
                }`}
              />
            </span>
          </div>


          <div className="password-wrapper">
            <input
              placeholder="Confirm Password"
              type={showConfirmPassword ? "text" : "password"}
              value={form.confirmPassword}
              onChange={(e) =>
                setForm({
                  ...form,
                  confirmPassword: e.target.value,
                })
              }
              required
              className="password-input"
            />

            <span
              className="password-eye"
              onClick={() =>
                setShowConfirmPassword(!showConfirmPassword)
              }
            >
              <i
                className={`bi ${
                  showConfirmPassword
                    ? "bi-eye"
                    : "bi-eye-slash"
                }`}
              />
            </span>
          </div>

          <button className="common-btn" disabled={loading}>
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        {error && (
          <p style={{ color: "red", marginTop: 10 }}>{error}</p>
        )}

        {success && (
          <p style={{ color: "green", marginTop: 10 }}>
            {success}
          </p>
        )}
      </div>
    </div>
  );
}
