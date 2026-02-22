"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import "@/assets/OrganizerRegistrations.css";

interface MyRegistration {
  id: string;
  eventTitle: string;
  status: "registered" | "cancelled" | "attended";
  registeredAt: string;
}

export default function MyRegistrationsPage() {
  const [data, setData] = useState<MyRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  

  useEffect(() => {
    const user = JSON.parse(
      localStorage.getItem("user") || "{}"
    );

    if (!user?.id) {
      setLoading(false);
      return;
    }

    axios
      .get(
        `/api/registrations/my-registrations?userId=${user.id}`
      )
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  

  const handleCancel = async (registrationId: string) => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this registration?"
    );

    if (!confirmCancel) return;

    try {
      await axios.delete(
        `/api/registrations/${registrationId}`
      );

      setData((prev) =>
        prev.map((r) =>
          r.id === registrationId
            ? { ...r, status: "cancelled" }
            : r
        )
      );

      alert("Registration cancelled successfully");
    } catch (error: any) {
      alert(
        error?.response?.data?.message ||
        "Failed to cancel registration"
      );
    }
  };

 

  const filteredData = useMemo(() => {
    return data.filter((item) =>
      item.eventTitle.toLowerCase().includes(search.toLowerCase())
    
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
      selector: (row: MyRegistration) => row.eventTitle,
      sortable: true,
    },
    {
      name: "Status",
      cell: (row: MyRegistration) => (
        <span className={`org-status status-${row.status}`}>
          {row.status}
        </span>
      ),
      sortable: true,
    },
    {
      name: "Registered At",
      selector: (row: MyRegistration) =>
        new Date(row.registeredAt).toLocaleString(),
      sortable: true,
    },
    {
      name: "Action",
      cell: (row: MyRegistration) =>
        row.status === "registered" ? (
          <button
            className="cancel-btn"
            onClick={() => handleCancel(row.id)}
          >
            Cancel
          </button>
        ) : null,
    },
  ];


  if (loading) {
    return (
      <p className="org-table-loading">
        Loading your registrations...
      </p>
    );
  }

  if (data.length === 0) {
    return (
      <p className="org-table-empty">
        You have no registrations yet.
      </p>
    );
  }

  return (
    <div className="org-table-wrapper">
      <h2 style={{ marginBottom: 16 }}>
        My Registrations
      </h2>

      <input
        type="text"
        placeholder="Search by event..."
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
  pagination: {
    style: {
      fontSize: "13px",
    },
  },
};
