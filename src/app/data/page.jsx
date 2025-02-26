"use client";
import { useEffect, useState } from "react";

const TableDisplay = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
        fetch("/api/getalldata",
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            }
        ) // Fetch from Flask
            .then((res) => res.json())
            .then((jsonData) => {
                // Convert timestamp to IST
                const formattedData = jsonData.map((item) => ({
                    ...item,
                    timestamp: new Date(item.timestamp).toLocaleString("en-IN", {
                        timeZone: "Asia/Kolkata",
                    }),
                }));
                setData(formattedData);
            })
            .catch((err) => console.error("Error fetching data:", err));
    }, []);

    // Function to convert JSON data to CSV format
    const convertToCSV = (data) => {
        const headers = [
            "Part ID",
            "Units Per Group",
            "Number Groups",
            "Measurement Unit",
            "Location",
            "Total Groups",
            "Timestamp (IST)"
        ];

        const csvRows = [
            headers.join(","), // Add headers
            ...data.map(entry =>
                [
                    entry.partID,
                    entry.unitsPerGroup,
                    entry.numGroups,
                    entry.measurementUnit,
                    entry.location,
                    entry.totalUnits,
                    entry.timestamp
                ].join(",")
            ),
        ];

        return csvRows.join("\n"); // Convert array to CSV format
    };

    // Function to trigger CSV file download
    const downloadCSV = () => {
        const csvData = convertToCSV(data);
        const blob = new Blob([csvData], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = "submitted_details.csv";
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div style={{ padding: "20px", textAlign: "center" }}>
            <h2 style={{ fontSize: "24px", marginBottom: "15px" }}>
                Submitted Details
            </h2>

            {/* Download CSV Button */}
            <button onClick={downloadCSV} style={btnStyle}>
                Download CSV
            </button>

            <div style={{ overflow: "auto", marginTop: "15px" }}>
                <table
                    style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        // background: "#fff",
                        boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.1)",
                    }}
                >
                    <thead>
                        <tr style={{ background: "#007bff", color: "#fff" }}>
                            <th style={thStyle}>Part ID</th>
                            <th style={thStyle}>Units Per Group</th>
                            <th style={thStyle}>Number Groups</th>
                            <th style={thStyle}>Measurement Unit</th>
                            <th style={thStyle}>Location</th>
                            <th style={thStyle}>Total Groups</th>
                            <th style={thStyle}>Timestamp (IST)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((entry, index) => (
                            <tr key={index} >
                                <td style={tdStyle}>{entry.partID}</td>
                                <td style={tdStyle}>{entry.unitsPerGroup}</td>
                                <td style={tdStyle}>{entry.numGroups}</td>
                                <td style={tdStyle}>{entry.measurementUnit}</td>
                                <td style={tdStyle}>{entry.location}</td>
                                <td style={tdStyle}>{entry.totalUnits}</td>
                                <td style={tdStyle}>{entry.timestamp}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// Inline styles
const thStyle = {
    padding: "12px 15px",
    textAlign: "left",
    borderBottom: "1px solid #ddd",
};

const tdStyle = {
    padding: "12px 15px",
    textAlign: "left",
    borderBottom: "1px solid #ddd",
};

const evenRowStyle = {
    background: "#f9f9f9",
};

const btnStyle = {
    padding: "10px 15px",
    fontSize: "16px",
    color: "#fff",
    background: "#007bff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    marginBottom: "10px",
};

export default TableDisplay;
