"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import ProtectedRoute from "@/components/ProtectedRoute";
import "@/assets/Common.css";

interface Attendee {
  id: string;
  name: string;
  email: string;
  registeredAt: string;
}

export default function EventAttendeesPage() {
  const { id } = useParams(); 
  const router = useRouter();

  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [eventTitle, setEventTitle] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`/api/events/${id}/attendees`)
      .then((res) => {
        setAttendees(res.data.attendees || []);
        setEventTitle(res.data.eventTitle || "");
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p style={{ textAlign: "center" }}>Loading...</p>;

  return (
    <ProtectedRoute requiredRole="organizer">
      <div style={{ maxWidth: 900, margin: "40px auto" }}>
        <h2>Attendees – {eventTitle}</h2>

        <p>
          <b>Total Attendees:</b> {attendees.length}
        </p>

        {attendees.length === 0 ? (
          <p>No one has registered yet.</p>
        ) : (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginTop: 20,
            }}
          >
            <thead>
              <tr style={{ background: "#f5f5f5" }}>
                <th style={thStyle}>#</th>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Registered On</th>
              </tr>
            </thead>

            <tbody>
              {attendees.map((a, index) => (
                <tr key={a.id}>
                  <td style={tdStyle}>{index + 1}</td>
                  <td style={tdStyle}>{a.name}</td>
                  <td style={tdStyle}>{a.email}</td>
                  <td style={tdStyle}>
                    {new Date(a.registeredAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <button
          className="common-btn"
          style={{ marginTop: 20 }}
          onClick={() => router.back()}
        >
          Back
        </button>
      </div>
    </ProtectedRoute>
  );
}

const thStyle = {
  padding: "10px",
  borderBottom: "1px solid #ddd",
  textAlign: "left" as const,
};

const tdStyle = {
  padding: "10px",
  borderBottom: "1px solid #eee",
};
