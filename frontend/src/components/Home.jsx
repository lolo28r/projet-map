import React from "react";
import { Link } from "react-router-dom";
import "../App.css"; // on importe le style global

function Home() {
    return (
        <div className="home-container">
            <h1 className="home-title">🌍 Carte Communautaire</h1>
            <Link to="/map" className="home-link">
                Voir la carte
            </Link>
        </div>
    );
}

export default Home;
