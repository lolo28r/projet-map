const mongoose = require("mongoose");
const Place = require("./places"); // ton schema Place

async function run() {
    await mongoose.connect("mongodb://localhost:27017/monprojet");

    const place = new Place({
        title: "Banc au parc",
        description: "Banc tranquille pour se reposer",
        category: "banc",
        image: "https://via.placeholder.com/150",
        location: { type: "Point", coordinates: [2.3522, 48.8566] },
        createdBy: "6902190b5a2867dbd939de64" // remplace par un ObjectId existant
    });

    await place.save();
    console.log("Place ajoutée !");
    mongoose.connection.close();
}

run();
