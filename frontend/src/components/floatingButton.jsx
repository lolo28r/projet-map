import React from "react";

export default function FloatingButton({ onClick, active }) {
    return (
        <button
            onClick={onClick}
            style={{
                position: "absolute",
                bottom: "20px",
                right: "20px",
                backgroundColor: active ? "#28a745" : "#007bff",
                color: "white",
                border: "none",
                borderRadius: "50%",
                width: "55px",
                height: "55px",
                fontSize: "28px",
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                zIndex: 1001,
                transition: "background-color 0.3s ease",
            }}
            title="Ajouter un lieu"
        >
            +
        </button>
    );
}
