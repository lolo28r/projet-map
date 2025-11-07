import React from "react";
import "./FloatingButton.css";

export default function FloatingButton({ onClick, active }) {
    return (
        <button
            className={`floating-button ${active ? "active" : ""}`}
            onClick={onClick}
            title="Ajouter un lieu"
        >
            {active ? "Annuler" : "Ajouter un lieu"}
        </button>
    );
}
