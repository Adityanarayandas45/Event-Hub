"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import "@/assets/OrganizerRegistrations.css";

interface OrganizerRegistration {
  id: string;
  eventTitle: string;
  attendeeName: string;
  attendeeEmail: string;
  status: "registered" | "cancelled" | "attended";
  registeredAt: string;
}

export default function AttendeesList() {
  const [data, setData] = useState<OrganizerRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    axios
      .get("/api/registrations/organizer")
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  
  const filteredData = useMemo(() => {
    return data.filter((item) =>
      item.eventTitle.toLowerCase().includes(search.toLowerCase()) ||
      item.attendeeName.toLowerCase().includes(search.toLowerCase()) ||
      item.attendeeEmail.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, data]);


  const columns = [
    {
      name: "#",
      cell: (_: any, index: number) => index + 1,
      width: "60px",
    },
    {
      name: "Event",
      selector: (row: OrganizerRegistration) => row.eventTitle,
      sortable: true,
    },
    {
      name: "Attendee",
      selector: (row: OrganizerRegistration) => row.attendeeName,
      sortable: true,
    },
    {
      name: "Email",
      selector: (row: OrganizerRegistration) => row.attendeeEmail,
      sortable: true,
    },
    {
      name: "Status",
      cell: (row: OrganizerRegistration) => (
        <span className={`org-status status-${row.status}`}>
          {row.status}
        </span>
      ),
      sortable: true,
    },
    {
      name: "Registered At",
      selector: (row: OrganizerRegistration) =>
        new Date(row.registeredAt).toLocaleString(),
      sortable: true,
    },
  ];

  if (loading) {
    return (
      <p className="org-table-loading">
        Loading registrations...
      </p>
    );
  }

  if (data.length === 0) {
    return (
      <p className="org-table-empty">
        No registrations yet.
      </p>
    );
  }

  return (
    <div className="org-table-wrapper">
      <h2 style={{ marginBottom: 16 }}>
        Attendees List
      </h2>

      <input
        type="text"
        placeholder="Search event, attendee or email..."
        className="datatable-search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <DataTable
        columns={columns}
        data={filteredData}
        pagination
        highlightOnHover
        striped
        responsive
        customStyles={customStyles}
      />
    </div>
  );
}



const customStyles = {
  headRow: {
    style: {
      backgroundColor: "#f5f7fb",
      fontWeight: "600",
      fontSize: "14px",
    },
  },
  rows: {
    style: {
      fontSize: "14px",
      padding: "8px 0",
    },
  },
};
