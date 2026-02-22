"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import EventsPage from "@/app/events/page";
import MyRegistrationsPage from "@/app/my-registrations/page";
import "@/assets/Common.css";

type AttendeeTab = "events" | "registrations";

export default function AttendeePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AttendeeTab>("events");

  const user =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("user") || "{}")
      : null;

      const handleLogout = () => {
        const confirmLogout = window.confirm("Do you want to logout?");
        
        if (!confirmLogout) return;
      
        localStorage.removeItem("user");
        router.replace("/login");
      };
      

  return (
    <ProtectedRoute requiredRole="attendee">
      <div className="attendee-layout">
      
        <aside className="attendee-sidebar">
          <h2 className="attendee-logo">Attendee</h2>

          <nav className="attendee-menu">
            <div
              className={`attendee-menu-item ${
                activeTab === "events" ? "active" : ""
              }`}
              onClick={() => setActiveTab("events")}
            >
              Events
            </div>

            <div
              className={`attendee-menu-item ${
                activeTab === "registrations" ? "active" : ""
              }`}
              onClick={() => setActiveTab("registrations")}
            >
              My Registrations
            </div>
          </nav>
        </aside>

      
        <main className="attendee-main">
         
          <div className="attendee-header">
            <div className="attendee-user">
              <div className="attendee-avatar">
                {user?.name?.charAt(0) || "U"}
              </div>

              <div className="attendee-user-info">
                <p className="attendee-name">
                  {user?.name || "User"}
                </p>
                
              </div>
            </div>

            <button
              className="attendee-logout-btn"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>

         
          {activeTab === "events" && <EventsPage />}
          {activeTab === "registrations" && (
            <MyRegistrationsPage />
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
