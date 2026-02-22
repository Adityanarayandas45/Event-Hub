"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import "@/assets/OrganizerDashboard.css";
import EventsPage from "../events/page";
import AttendeesList from "@/components/AttendeesList";
import "@/assets/Common.css";


import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type TabType = "dashboard" | "events" | "registrations";

export default function OrganizerPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");

  const [totalEvents, setTotalEvents] = useState(0);
  const [totalRegistrations, setTotalRegistrations] = useState(0);
  const [upcomingEvents, setUpcomingEvents] = useState(0);

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

  useEffect(() => {
    if (!user?.id) return;

    axios
      .get(`/api/organizer/dashboard?organizerId=${user.id}`)
      .then((res) => {
        setTotalEvents(res.data.totalEvents);
        setTotalRegistrations(res.data.totalRegistrations);
        setUpcomingEvents(res.data.upcomingEvents);
      })
      .catch(() => {
        console.error("Failed to load dashboard stats");
      });
  }, [user?.id]);

  
  const chartData = [
    { name: "Events", value: totalEvents },
    { name: "Registrations", value: totalRegistrations },
    { name: "Upcoming", value: upcomingEvents },
  ];

  return (
    <ProtectedRoute requiredRole="organizer">
      <div className="org-layout">
   
        <aside className="org-sidebar">
          <h2 className="org-logo">Organizer</h2>

          <nav className="org-menu">
            <div
              className={`org-menu-item ${
                activeTab === "dashboard" ? "active" : ""
              }`}
              onClick={() => setActiveTab("dashboard")}
            >
              Dashboard
            </div>

            <div
              className={`org-menu-item ${
                activeTab === "events" ? "active" : ""
              }`}
              onClick={() => setActiveTab("events")}
            >
              Events
            </div>

            <div
              className={`org-menu-item ${
                activeTab === "registrations" ? "active" : ""
              }`}
              onClick={() => setActiveTab("registrations")}
            >
              Registrations
            </div>
          </nav>
        </aside>

        
        <main className="org-main">
         
          <div className="org-header">
            <div className="org-user">
              <div className="org-avatar">
                { "O"}
              </div>

              <div className="org-user-info">
                <p className="org-user-name">
                  { "Organizer"}
                </p>
               
              </div>
            </div>

            <button
              className="org-logout-btn"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>

     
          {activeTab === "dashboard" && (
            <>
              <h2 className="org-page-title">Dashboard</h2>

              
              <div className="org-stats">
                <div className="org-stat-card">
                  <p>Total Events</p>
                  <h3>{totalEvents}</h3>
                </div>

                <div className="org-stat-card">
                  <p>Total Registrations</p>
                  <h3>{totalRegistrations}</h3>
                </div>

                <div className="org-stat-card">
                  <p>Upcoming Events</p>
                  <h3>{upcomingEvents}</h3>
                </div>
              </div>

              
              <div className="org-charts">
                
                <div className="org-chart-card">
                  <h3>Overview</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar
                        dataKey="value"
                        fill="#f97316"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

               
                <div className="org-chart-card">
                  <h3>Summary Trend</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#2563eb"
                        strokeWidth={3}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}

         
          {activeTab === "events" && (
            <>
              <div className="org-events-header">
                <Link href="/organizer/categories">
                  <button className="org-btn secondary">
                    Manage Categories
                  </button>
                </Link>

                <Link href="/organizer/events/create">
                  <button className="org-btn primary">
                    Create Event +
                  </button>
                </Link>
              </div>

              <EventsPage />
            </>
          )}

          {activeTab === "registrations" && (
            <>
              <h2 className="org-page-title">Registrations</h2>
              <AttendeesList />
            </>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
