const { getAllPatients, getSinglePatient, getPatientAppointments } = require("../controllers/patientController");
const express = require("express");
const router = express.Router();

router.get("/", getAllPatients);
router.get("/:id", getSinglePatient);
router.get("/:id/appointments", getPatientAppointments);

module.exports = router;