"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import ProtectedRoute from "@/components/ProtectedRoute";
import "@/assets/Common.css";
import "@/assets/EditEvent.css";

import dynamic from "next/dynamic";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useMapEvents } from "react-leaflet";

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

export default function EditEventPage() {
  const { id } = useParams();
  const router = useRouter();

  const [categories, setCategories] = useState<any[]>([]);
  const [markerPosition, setMarkerPosition] =
    useState<[number, number] | null>(null);

  const [form, setForm] = useState<any>({
    title: "",
    description: "",
    location: "",
    eventDate: "",
    capacity: "",
    categoryId: "",
    status: "",
    latitude: "",
    longitude: "",
  });

  const [errors, setErrors] = useState<any>({});
  const [image, setImage] = useState<File | null>(null);



  useEffect(() => {
    axios.get("/api/categories").then((res) => {
      setCategories(res.data);
    });

    axios.get(`/api/events/${id}`).then((res) => {
      const e = res.data;

      setForm({
        title: e.title,
        description: e.description,
        location: e.location,
        eventDate: e.eventDate.split("T")[0],
        capacity: e.capacity,
        categoryId: e.categoryId || "",
        status: e.status || "",
        latitude: e.latitude || "",
        longitude: e.longitude || "",
      });

      if (e.latitude && e.longitude) {
        setMarkerPosition([
          Number(e.latitude),
          Number(e.longitude),
        ]);
      }
    });
  }, [id]);

 
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

    if (name === "image" && value) {
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
      ];

      if (!allowedTypes.includes(value.type)) {
        error =
          "Image must be JPG, PNG, or WebP format";
      } else if (value.size > 5 * 1024 * 1024) {
        error = "Image must be under 5MB";
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

    setForm((prev: any) => ({
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

        setForm((prev: any) => ({
          ...prev,
          location: data.display_name || "",
          latitude: lat.toString(),
          longitude: lng.toString(),
        }));

        validateField(
          "location",
          data.display_name || ""
        );
      },
    });

    return markerPosition ? (
      <Marker position={markerPosition} />
    ) : null;
  }



  const handleUpdate = async () => {
    const user = JSON.parse(
      localStorage.getItem("user") || "{}"
    );

    const formData = new FormData();

    Object.entries(form).forEach(([k, v]) => {
      if (k === "eventDate") {
        formData.append(
          "eventDate",
          new Date(v as string).toISOString()
        );
      } else {
        formData.append(k, String(v));
      }
    });

    formData.append("organizerId", user.id);

    if (image) formData.append("image", image);

    try {
      const res = await axios.put(
        `/api/events/${id}`,
        formData
      );

      alert(res.data.message || "Event updated");
      router.push(`/events/${id}`);
    } catch (err: any) {
      alert(
        err.response?.data?.message ||
          "Update failed"
      );
    }
  };

 

  return (
    <ProtectedRoute requiredRole="organizer">
      <div className="edit-event-page">
        <h2 className="edit-event-title">
          Edit Event
        </h2>

        <div className="edit-event-form">

          
          <input
            name="title"
            className="form-input"
            placeholder="Title"
            value={form.title}
            onChange={handleChange}
          />
          {errors.title && <small className="error">{errors.title}</small>}

         
          <textarea
            name="description"
            className="form-textarea"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
          />
          {errors.description && <small className="error">{errors.description}</small>}

     
          <input
            name="location"
            className="form-input"
            placeholder="Location"
            value={form.location}
            onChange={handleChange}
          />
          {errors.location && <small className="error">{errors.location}</small>}


          <div style={{ marginTop: 20 }}>
            <p>Select location by clicking on map</p>

            <MapContainer
              center={
                markerPosition || [20.5937, 78.9629]
              }
              zoom={markerPosition ? 13 : 5}
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
          />
          {errors.eventDate && <small className="error">{errors.eventDate}</small>}

        
          <input
            name="capacity"
            className="form-input"
            type="number"
            placeholder="Capacity"
            value={form.capacity}
            onChange={handleChange}
          />
          {errors.capacity && <small className="error">{errors.capacity}</small>}

          <select
            name="categoryId"
            className="form-select"
            value={form.categoryId}
            onChange={handleChange}
          >
            <option value="">Select Category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          
          <select
            name="status"
            className="form-select"
            value={form.status}
            onChange={handleChange}
          >
            
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

        
          <input
            className="form-file"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageChange}
          />
          {errors.image && <small className="error">{errors.image}</small>}

          <button
            className="common-btn edit-event-btn"
            onClick={handleUpdate}
          >
            Update Event
          </button>
        </div>
      </div>
    </ProtectedRoute>
  );
}
