const { createDoctor, getAllDoctors, getSingleDoctor, updateDoctor, statusUpdateDoctor, getDoctorAppointments } = require("../controllers/doctorController");
const express = require("express");
const router = express.Router();

router.post("/",createDoctor);
router.get("/",getAllDoctors);
router.get("/:id",getSingleDoctor);
router.put("/:id",updateDoctor);
router.patch("/:id",statusUpdateDoctor);
router.get("/:id/appointments",getDoctorAppointments);

module.exports = router;