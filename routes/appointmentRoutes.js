const express = require("express");
const { bookAppointment, getAllAppointments, getTodayAppointments, getAvailableSlots, getSingleAppointment, updateAppointmentStatus, updatePaymentStatus } = require("../controllers/appointmentController");
const router = express.Router();

router.post("/book",bookAppointment);
router.get("/",getAllAppointments);
router.get("/today",getTodayAppointments);
router.get("/available-slots/:doctorId",getAvailableSlots);
router.get("/:id",getSingleAppointment);
router.patch("/:id/status",updateAppointmentStatus);
router.patch("/:id/payment",updatePaymentStatus);

module.exports = router;
