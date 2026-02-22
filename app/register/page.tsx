"use client";

import { useState } from "react";
import { z } from "zod";
import emailjs from "@emailjs/browser";
import { useCallApi } from "../api/hooks/CallApi";
import { useRouter } from "next/navigation";
import "@/assets/Common.css";



const registerSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .regex(/^[A-Za-z\s]+$/, "Name must contain letters only"),

  email: z
    .string()
    .email("Invalid email address")
    .refine((val) => !val.includes(".in"), {
      message: "Invalid email address",
    }),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must include one uppercase letter")
    .regex(/[a-z]/, "Must include one lowercase letter")
    .regex(/[0-9]/, "Must include one number"),

  role: z.string(),
});

type FormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [form, setForm] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    role: "attendee",
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof FormData, string>>
  >({});

  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");



  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, placeholder } = e.target;

    let fieldName = "";

    if (placeholder === "Name") fieldName = "name";
    if (placeholder === "Email") fieldName = "email";
    if (placeholder === "Password") fieldName = "password";

    const updatedForm = { ...form, [fieldName]: value };
    setForm(updatedForm);


    const fieldSchema =
    registerSchema.shape[fieldName as keyof FormData];

    const result = fieldSchema.safeParse(value);

    setErrors((prev) => ({
      ...prev,
      [fieldName]: result.success
        ? ""
        : result.error.issues[0].message,
    }));
  };



  const handleSubmit = async (
    e: React.SyntheticEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setMessage("");

 
    const result = registerSchema.safeParse(form);

    if (!result.success) {
      const fieldErrors: any = {};
      result.error.issues.forEach((err) => {
        fieldErrors[err.path[0]] = err.message;
      });
      setErrors(fieldErrors);
      setLoading(false);
      return;
    }

    const res = await useCallApi("/api/auth/register", form);

    if (!res.success) {
      setMessage(res.error || "Registration failed");
      setLoading(false);
      return;
    }

    try {
      await emailjs.send(
        "service_ipvtqrk",
        "template_d0kdw7c",
        {
          name: form.name,
          email: form.email,
          otp: res.data.otp,
        },
        "a6I2mKdYOJV6Wlc72"
      );
      localStorage.setItem("verifyEmail", form.email);
      localStorage.setItem("tempPassword", form.password);

      setMessage("Registration successful. OTP sent to your email.");
      router.push("/verify-otp");
      setForm({
        name: "",
        email: "",
        password: "",
        role: "attendee",
      });
    } catch {
      setMessage("Failed to send OTP email");
    }

    setLoading(false);
  };

  return (
    <div className="common-wrapper">
      <div className="common-right">
        <h2>Register Here</h2>

        <form onSubmit={handleSubmit} className="common-form">

       
          <input
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
            required
          />
          {errors.name && (
            <small className="error">{errors.name}</small>
          )}

         
          <input
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
          />
          {errors.email && (
            <small className="error">{errors.email}</small>
          )}

         
          <div className="password-wrapper">
            <input
              placeholder="Password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={handleChange}
              required
              className="password-input"
            />

            <span
              className="password-eye"
              onClick={() =>
                setShowPassword(!showPassword)
              }
            >
              <i
                className={`bi ${
                  showPassword ? "bi-eye" : "bi-eye-slash"
                }`}
              />
            </span>
          </div>
          {errors.password && (
            <small className="error">{errors.password}</small>
          )}

          <button className="common-btn" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>

          <button
            type="button"
            className="common-btn"
            onClick={() => router.push("/login")}
          >
            Login
          </button>
        </form>

        {message && <p className="message">{message}</p>}
      </div>
    </div>
  );
}
