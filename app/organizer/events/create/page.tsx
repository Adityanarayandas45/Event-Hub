"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import "@/assets/CreateEvent.css";
import { useMapEvents } from "react-leaflet";
import dynamic from "next/dynamic";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((m) => m.Marker),
  { ssr: false }
);

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function CreateEventPage() {
  const router = useRouter();

  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    eventDate: "",
    capacity: "",
    categoryId: "",
    status: "draft",
  });

  const [errors, setErrors] = useState<any>({});
  const [image, setImage] = useState<File | null>(null);

  const [markerPosition, setMarkerPosition] =
    useState<[number, number] | null>(null);

  const user =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("user") || "{}")
      : null;

  const organizerId = user?.id;

  useEffect(() => {
    axios.get("/api/categories").then((res) => {
      setCategories(res.data);
    });
  }, []);

 
  const validateField = (name: string, value: any) => {
    let error = "";

    if (name === "title") {
      if (!value.trim()) error = "Title is required";
      else if (value.length < 5)
        error = "Title must be at least 5 characters";
    }

    if (name === "description") {
      if (!value.trim())
        error = "Description is required";
      else if (value.length < 20)
        error =
          "Description must be at least 20 characters";
    }

    if (name === "location") {
      if (!value) error = "Location is required";
    }

    if (name === "eventDate") {
      if (!value) error = "Event date is required";
      else if (new Date(value) <= new Date())
        error = "Event must be in the future";
    }

    if (name === "capacity") {
      if (!value) error = "Capacity is required";
      else if (Number(value) < 1)
        error = "Capacity must be at least 1";
    }

    if (name === "categoryId") {
      if (!value) error = "Category is required";
    }

    if (name === "status") {
      if (!value) error = "Status is required";
    }

    if (name === "image") {
      if (!value) return;

      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
      ];

      if (!allowedTypes.includes(value.type)) {
        error =
          "Image must be JPG, PNG, or WebP format";
      } else if (value.size > 5 * 1024 * 1024) {
        error = "Image size must be less than 5MB";
      }
    }

    setErrors((prev: any) => ({
      ...prev,
      [name]: error,
    }));
  };

 

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    validateField(name, value);
  };

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0] || null;
    setImage(file);
    validateField("image", file);
  };

   

  function LocationMarker() {
    useMapEvents({
      async click(e) {
        const { lat, lng } = e.latlng;
        setMarkerPosition([lat, lng]);

        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
        );
        const data = await res.json();

        const locationName =
          data.display_name || "";

        setForm((prev) => ({
          ...prev,
          location: locationName,
        }));

        validateField("location", locationName);
      },
    });

    return markerPosition ? (
      <Marker position={markerPosition}></Marker>
    ) : null;
  }

  
  const handleSubmit = async (
    e: React.SyntheticEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);

    try {
      const formData = new FormData();

      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("location", form.location);
      formData.append("eventDate", form.eventDate);
      formData.append("capacity", form.capacity);
      formData.append("categoryId", form.categoryId);
      formData.append("organizerId", organizerId);
      formData.append("status", form.status);

      if (image) {
        formData.append("image", image);
      }

      await axios.post("/api/events", formData);

      alert("Event created successfully");
      router.push("/organizer");
    } catch (err: any) {
      alert(
        err?.response?.data?.message ||
          "Failed to create event"
      );
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="create-event-page">
      <h2 className="create-event-title">
        Create Event
      </h2>

      <form
        className="create-event-form"
        onSubmit={handleSubmit}
      >
        <input
          className="form-input"
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={handleChange}
          required
        />
        {errors.title && (
          <small className="error">
            {errors.title}
          </small>
        )}

        <textarea
          className="form-textarea"
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          required
        />
        {errors.description && (
          <small className="error">
            {errors.description}
          </small>
        )}

        <div className="map-wrapper">
          <p>Select location by clicking on map</p>

          <MapContainer
            center={[20.5937, 78.9629]}
            zoom={5}
            style={{
              height: "350px",
              width: "100%",
            }}
          >
            <TileLayer
              attribution="© OpenStreetMap"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker />
          </MapContainer>

          {errors.location && (
            <small className="error">
              {errors.location}
            </small>
          )}

          {form.location && (
            <p className="selected-location">
              <strong>Selected:</strong>{" "}
              {form.location}
            </p>
          )}
        </div>

        <input
          className="form-input"
          type="date"
          name="eventDate"
          min={
            new Date()
              .toISOString()
              .split("T")[0]
          }
          value={form.eventDate}
          onChange={handleChange}
          required
        />
        {errors.eventDate && (
          <small className="error">
            {errors.eventDate}
          </small>
        )}

        <input
          className="form-input"
          type="number"
          name="capacity"
          placeholder="Capacity"
          min="1"
          value={form.capacity}
          onChange={handleChange}
          required
        />
        {errors.capacity && (
          <small className="error">
            {errors.capacity}
          </small>
        )}

        <select
          className="form-select"
          name="categoryId"
          value={form.categoryId}
          onChange={handleChange}
          required
        >
          <option value="">
            Select Category
          </option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {errors.categoryId && (
          <small className="error">
            {errors.categoryId}
          </small>
        )}

        <select
          className="form-select"
          name="status"
          value={form.status}
          onChange={handleChange}
          required
        >
          <option value="draft">
            Draft
          </option>
          <option value="published">
            Published
          </option>
          <option
            value="completed"
            disabled
          >
            Completed
          </option>
        </select>
        {errors.status && (
          <small className="error">
            {errors.status}
          </small>
        )}

        <input
          className="form-file"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleImageChange}
        />
        {errors.image && (
          <small className="error">
            {errors.image}
          </small>
        )}

        <button
          className="form-submit-btn"
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Event"}
        </button>
      </form>
    </div>
  );
}
