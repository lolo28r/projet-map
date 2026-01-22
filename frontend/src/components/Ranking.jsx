import { useEffect, useState } from "react";
import axios from "axios";

function Ranking() {
    const [places, setPlaces] = useState([]);
    const [category, setCategory] = useState("");

    useEffect(() => {
        axios.get("http://localhost:3000/api/places/ranking", {
            params: category ? { category } : {}
        }).then(res => setPlaces(res.data));
    }, [category]);

    return (
        <div>
            <h1>Classement des lieux</h1>

            <select onChange={e => setCategory(e.target.value)}>
                <option value="">Tous</option>
                <option value="poubelle">Poubelles</option>
                <option value="banc">Bancs</option>
                <option value="point de vue">Points de vue</option>
                <option value="toilettes">Toilettes</option>
                <option value="fontaine">Fontaines</option>
            </select>

            <ul>
                {places.map((p, i) => (
                    <li key={p._id}>
                        <strong>#{i + 1} {p.title}</strong> — ⭐ {p.averageRating.toFixed(1)}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Ranking;
