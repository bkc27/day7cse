const Patient = require("../models/Patient")
const Appointment = require("../models/Appointment");

const getAllPatients = async (req, res, next) => {
    try {
        const { search } = req.query;
        const filter = {};
        if (search) {
            filter.$or = [
                {
                    name: {
                        $regex: search,
                        $options: "i"
                    }
                },
                {
                    phone: {
                        $regex: search,
                        $options: "i"
                    }
                }
            ];
        }
        const patients = await Patient.find(filter)
            .sort({ createdAt: -1 });
        res.json({
            success: true,
            count: patients.length,
            data: patient
        });
    } catch (error) {
        next(error);
    }
};

const getSinglePatient = async (req, res, next) => {
    try {
        const { id } = req.params;
        const patient = await Patient.findById(id);
        if (!patient) {
            return res.status(403).json({
                success: false,
                message: "Invalid Id"
            });
        }
        res.json({
            success: true,
            data: patient
        });
    } catch (error) {
        next(error);
    }
};

const getPatientAppointments = async (req, res, next) => {
    try {
        const { id } = req.params;
        const appointments = await Appointment.find({ patient: id })
            .populate("doctor", "name specialization consulationFee roomNumber")
            .sort({ appointmentDate: -1 });
        res.json({
            success: true,
            count: appointments.length,
            data: appointments
        })
    } catch (error) {
        next(error);
    }
};

module.exports = { getAllPatients, getSinglePatient, getPatientAppointments};