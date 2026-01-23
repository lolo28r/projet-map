import "./starRating.css";
function StarRating({ value, max = 5 }) {
    if (value === undefined || value === null) return null;

    const fullStars = Math.floor(value);
    const hasHalf = value - fullStars >= 0.5;
    const emptyStars = max - fullStars - (hasHalf ? 1 : 0);

    return (
        <div className="star-rating" title={`${value}/5`}>
            {[...Array(fullStars)].map((_, i) => (
                <span key={`f-${i}`} className="star full">★</span>
            ))}
            {hasHalf && <span className="star half">★</span>}
            {[...Array(emptyStars)].map((_, i) => (
                <span key={`e-${i}`} className="star empty">★</span>
            ))}
        </div>
    );
}

export default StarRating;
