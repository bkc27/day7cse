const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorMiddleware");
connectDB();

const doctorRoutes = require("./routes/doctorRoutes");
const patientRoutes = require("./routes/patientRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req,res)=> {
    res.json({
        success: true,
        message: "Server Running..."
    });
});

app.use("/api/doctors",doctorRoutes);
app.use("/api/patients",patientRoutes);
app.use("/api/appointments",appointmentRoutes);
app.use((req,res)=>{
    res.status(404).json({
        success:false,
        message:"API URL DOES NOT EXIST"
    });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5001;
app.listen(PORT,()=>{
    console.log(`Server running at http://localhost:${PORT}`);
});