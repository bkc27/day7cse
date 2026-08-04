const Doctor = require("../models/Doctor")
const Patient = require("../models/Patient")
const Appointment = require("../models/Appointment")

const generateAppointmentNumber = () => {
    const datePart = Date.now().toString().slice(-6);
    const randomPart = Math.floor(100 + Math.random() * 9);
    return `APT-${datePart}-${randomPart}`;
};

const getDayName = (date) => {
    return new Intl.DateTimeFormat("en-US", {
        weekday: "long"
    }).format(date);
};

const normalizeDate = (dateValue) => {
    const date = new Date(dateValue);
    date.setHours(0, 0, 0, 0);
    return date;
};

const bookAppointment = async (req, res, next) => {
    try {
        const {
            doctorId, patientName, phone,
            email, age, gender, address, appointmentDate, appointmentTime, reason, symptoms, bookingType
        } = req.body;

        if (!doctorid || !patientName || !phone || age === undefined || !gender || !appointmentDate || !appointmentTime || !reason) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields"
            });
        }

    } catch (error) {
        next(error);
    }
};
