"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import ProtectedRoute from "@/components/ProtectedRoute";

import "@/assets/Common.css";
import "@/assets/EventDetails.css";

export default function EventDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`/api/events/${id}`).then((res) => {
      setEvent(res.data);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <p className="event-loading">Loading...</p>;
  if (!event) return <p className="event-not-found">Event not found</p>;

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isOrganizer = user?.id === event.organizerId;

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this event?"
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(`/api/events/${id}`);
      alert("Event deleted successfully");
      router.push("/organizer");
    } catch (error) {
      alert("Failed to delete event");
      console.error(error);
    }
  };

  return (
    <ProtectedRoute>
      <div className="event-details-page">
        <h2 className="event-title">{event.title}</h2>
        <div className="event-content">

        {event.imageUrl && (
          <img
            src={event.imageUrl}
            alt={event.title}
            className="event-image"
          />
        )}

        <div className="event-info">
          <p>
            <strong>Description:</strong> {event.description}
          </p>
          <p>
            <strong>Location:</strong> {event.location}
          </p>
          <p>
            <strong>Date:</strong>{" "}
            {new Date(event.eventDate).toLocaleString()}
          </p>
          <p>
            <strong>Capacity:</strong>{" "}
            {event.registeredCount}/{event.capacity}
          </p>
        </div>
        </div>
        {isOrganizer && (
          <div className="event-actions">
            <button
              className="common-btn"
              onClick={() =>
                router.push(`/organizer/events/edit/${event.id}`)
              }
            >
              Edit Event
            </button>

            <button
              onClick={handleDelete}
              className="common-btn danger-btn"
            >
              Delete Event
            </button>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
