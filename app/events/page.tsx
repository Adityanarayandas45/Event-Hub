"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "@/assets/EventsPage.css"
interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  eventDate: string;
  capacity: number;
  registeredCount: number;
  status: string;
  imageUrl?: string | null;
  categoryName: string;
  organizerName: string;
}

export default function EventsPage() {

  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [registeredEvents, setRegisteredEvents] = useState<string[]>([]);

  const router = useRouter();

  const user =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("user") || "{}")
      : null;

  const role = user?.role;

  useEffect(() => {
    axios
      .get("/api/events")
      .then((res) => {
        setEvents(res.data);
        setFilteredEvents(res.data);
      })
      .finally(() => setLoading(false));
  }, []);



  useEffect(() => {
    let data = [...events];

    if (role === "attendee") {
      data = data.filter((e) => e.status !== "draft");
    }

    if (category) {
      data = data.filter(
        (e) =>
          e.categoryName.toLowerCase() ===
          category.toLowerCase()
      );
    }

    if (status) {
      data = data.filter((e) => e.status === status);
    }

    if (fromDate) {
      data = data.filter(
        (e) =>
          new Date(e.eventDate) >= new Date(fromDate)
      );
    }

    if (toDate) {
      data = data.filter(
        (e) =>
          new Date(e.eventDate) <= new Date(toDate)
      );
    }

    setFilteredEvents(data);
  }, [category, status, fromDate, toDate, events, role]);
  useEffect(() => {
    if (!user?.id) return;
  
    const fetchRegistrations = async () => {
      const res = await axios.get(
        `/api/registrations/my-registrations?userId=${user.id}`
      );
  
     
      const registeredIds = res.data
        .filter((r: any) => r.status === "registered")
        .map((r: any) => String(r.eventId));
  
      setRegisteredEvents(registeredIds);
    };
  
    fetchRegistrations();
  }, [user?.id]);
  
  
  const handleRegister = async (eventId: string) => {
    if (!user?.id) {
      alert("Please login to register");
      router.push("/login");
      return;
    }

    try {
      const res = await axios.post("/api/registrations", {
        eventId,
        userId: user.id,
      });

      alert(res.data.message || "Registered successfully");


      setRegisteredEvents((prev) => [...prev, eventId]);

    } catch (error: any) {
      alert(
        error?.response?.data?.message ||
        "Registration failed"
      );
    }
  };

  


  if (loading) {
    return (
      <div className="events-page">

        <div className="org-filter-bar">
          <div className="skeleton-filter" />
          <div className="skeleton-filter" />
          <div className="skeleton-filter" />
          <div className="skeleton-filter" />
        </div>


        <div className="org-events-grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="event-card skeleton-card">
              <div className="skeleton-image" />

              <div className="event-card-body">
                <div className="skeleton-title" />
                <div className="skeleton-text" />
                <div className="skeleton-text short" />

                <div className="skeleton-meta" />
                <div className="skeleton-meta" />
                <div className="skeleton-meta" />

                <div className="skeleton-btn" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }


  return (
    <div className="events-page">

      <div className="org-filter-bar">
        <div className="filter-dropdown">
          <div
            className="filter-select dropdown-trigger"
            onClick={() =>
              setShowCategoryDropdown(!showCategoryDropdown)
            }
          >
            {category || "All Categories"}
            <span className="dropdown-arrow">
              {showCategoryDropdown ? "▲" : "▼"}
            </span>
          </div>


          {showCategoryDropdown && (
            <ul className="filter-list">
              <li
                onClick={() => {
                  setCategory("");
                  setShowCategoryDropdown(false);
                }}
              >
                All Categories
              </li>

              <li
                onClick={() => {
                  setCategory("Technology");
                  setShowCategoryDropdown(false);
                }}
              >
                Technology
              </li>

              <li
                onClick={() => {
                  setCategory("Music");
                  setShowCategoryDropdown(false);
                }}
              >
                Music
              </li>
            </ul>
          )}
        </div>


        <div className="filter-dropdown">
          <div
            className="filter-select dropdown-trigger"
            onClick={() =>
              setShowStatusDropdown(!showStatusDropdown)
            }
          >
            {status || "All Status"}
            <span className="dropdown-arrow">
              {showStatusDropdown ? "▲" : "▼"}
            </span>
          </div>

          {showStatusDropdown && (
            <ul className="filter-list">
              <li
                onClick={() => {
                  setStatus("");
                  setShowStatusDropdown(false);
                }}
              >
                All Status
              </li>

              <li
                onClick={() => {
                  setStatus("draft");
                  setShowStatusDropdown(false);
                }}
              >
                Draft
              </li>

              <li
                onClick={() => {
                  setStatus("published");
                  setShowStatusDropdown(false);
                }}
              >
                Published
              </li>

              <li
                onClick={() => {
                  setStatus("completed");
                  setShowStatusDropdown(false);
                }}
              >
                Completed
              </li>
            </ul>
          )}
        </div>


        <input
          className="filter-input"
          type="date"
          value={fromDate}
          onChange={(e) =>
            setFromDate(e.target.value)
          }
        />

        <input
          className="filter-input"
          type="date"
          value={toDate}
          onChange={(e) =>
            setToDate(e.target.value)
          }
        />
      </div>


      <div className="org-events-grid">
        {filteredEvents.map((event) => (
          <div key={event.id} className="event-card">
            {event.imageUrl && (
              <img
                className="event-card-image"
                src={event.imageUrl}
                alt={event.title}
              />
            )}

            <div className="event-card-body">
              <h4 className="event-title">
                {event.title}
              </h4>

              <p className="event-desc">
                {event.description.slice(0, 80)}...
              </p>

              <p className="event-meta">
                <b>Category:</b>{" "}
                {event.categoryName}
              </p>

              <p className="event-meta">
                <b>Status:</b>{" "}
                <span
                  className={`event-status ${event.status === "completed"
                    ? "status-completed"
                    : "status-active"
                    }`}
                >
                  {event.status}
                </span>

              </p>

              <p className="event-meta">
                <b>Date:</b>{" "}
                {new Date(
                  event.eventDate
                ).toLocaleDateString()}
              </p>

              <p className="event-meta">
                <b>Seats:</b>{" "}
                {event.registeredCount}/
                {event.capacity}
              </p>

              {role === "attendee" &&
                event.status === "published" &&
                event.registeredCount < event.capacity && (

                  registeredEvents.includes(String(event.id)) ? (
                    <button
                      className="common-btn register-btn"
                      disabled
                      style={{
                        background: "#4caf50",
                        cursor: "not-allowed",
                      }}
                    >
                      Registered
                    </button>
                  ) : (
                    <button
                      className="common-btn register-btn"
                      onClick={() =>
                        handleRegister(event.id)
                      }
                    >
                      Register
                    </button>
                  )
                )}




              <Link href={`/events/${event.id}`}>
                <button className="common-btn secondary">
                  View Details
                </button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
