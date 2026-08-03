const mongoose = require("mongoose")

const connectDB = () => {
    try {
        mongoose.connect(process.env.MONGODB_URI);
        console.log("DATABASE CONNECTED");
    } catch (error) {
        console.log("Unable to connect to DB");
    }
};

module.exports = connectDB;