const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const cors = require('cors');
const app = express();
const port = 3000;
const userRoutes = require('./routes/userRoutes');
const placeRoutes = require('./routes/placeRoutes');


//middlewares
app.use(cors());
app.use(express.json());
app.use('/api/users', userRoutes);
app.use('/api/places', placeRoutes);
app.use("/uploads", express.static("uploads"));


app.get('/', (req, res) => {
    res.send('Hello world');
});

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('connected to mongoDB');
    })
    .catch(err => {
        console.error('error connecting to mongoDB', err);
    });


app.listen(port, () => {
    console.log(`server online at http://localhost:${port}`);
});