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
    const date = new Date();
    // console.log(date);
    date.setHours(0, 0, 0, 0);
    return date;
};

const bookAppointment = async (req, res, next) => {
    try {
        const {
            doctorId, patientName, phone,
            email, age, gender, address, appointmentDate, appointmentTime, reason, symptoms, bookingType
        } = req.body;

        if (!doctorId || !patientName || !phone || age === undefined || !gender || !appointmentDate || !appointmentTime || !reason) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields"
            });
        }

        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            return res.status(403).json({
                success: false,
                message: "Doctor Not Found"
            });
        }

        if (!doctor.isActive) {
            return res.status(403).json({
                success: false,
                message: "Doctor is Unavailable"
            });
        }

        const selectedDate = normalizeDate(appointmentDate);
        const today = normalizeDate(new Date());

        if (selectedDate < today) {
            return res.status(400).json({
                success: false,
                message: "Past date appointment is not allowed"
            });
        }

        const selectedDay = getDayName(selectedDate);
        if (!doctor.availableDays.includes(selectedDay)) {
            return res.status(400).json({
                success: false,
                message: `Doctor is not available on ${selectedDay}`
            });
        }

        if (appointmentTime < doctor.startTime || appointmentTime >= doctor.endTime) {
            return res.status(400).json({
                success: false,
                message: `Appointment must be between ${doctor.startTime} and ${doctor.endTime}`
            })
        }

        const existingAppointment = await Appointment.findOne({
            doctor: doctorId,
            appointmentDate: selectedDate,
            appointmentTime,
            status: {
                $ne: "Cancelled"
            }
        });

        if (existingAppointment) {
            return res.status(400).json({
                success: false,
                message: "Appointment already booked for this slot"
            })
        }


        let patient = await Patient.findOne({
            name: {
                $regex: `^${patientName}`,
                $options: "i"
            },
            phone
        });
        if (!patient) {
            patient = await Patient.create({
                name: patientName,
                phone, email, age, gender, address
            });
        }
        else {
            patient.age = age;
            patient.gender = gender;
            if (email)
                patient.email = email;
            if (address)
                patient.address = address;

            await patient.save();
        }

        const appointmentCount = await Appointment.countDocuments({
            doctor: doctorId,
            appointmentDate: selectedDate,
            status: {
                $ne: "Cancelled"
            }
        });

        const tokenNumber = appointmentCount + 1;

        const appointment = await Appointment({
            appointmentNumber: generateAppointmentNumber(),
            doctor: doctorId,
            patient: patient._id,
            appointmentDate: selectedDate,
            appointmentTime,
            reason,
            symptoms: symptoms || [],
            bookingType: bookingType || "Online",
            consulationFee: doctor.consultationFee,
            tokenNumber
        });

        const populatedAppointment = await Appointment.findById(appointment._id)
            .populate("doctor", "name specialization phone consulationFee")
            .populate("patient", "name age phone gender");

        res.status(201).json({
            success: true,
            message: "Appointment Booked Successfully",
            data: populatedAppointment
        });
    } catch (error) {
        next(error);
    }
};

const getAllAppointments = async (req, res, next) => {
    try {
        const { doctorId, patientId, status, date } = req.query;
        const filter = {};
        if (doctorId) {
            filter.doctor = doctorId;
        }
        if (patientId) {
            filter.patient = patientId;
        }
        if (status) {
            filter.status = status;
        }
        if (date) {
            filter.appointmentDate = normalizeDate(date);
        }

        const appointments = await Appointment.find(filter)
            .populate("doctor", "name specialization phone consultationFee")
            .populate("patient", "name age phone gender")
            .sort({
                appointmentDate: 1, appointmentTime: 1
            });
        res.json({
            success: true,
            count: appointments.length,
            data: appointments
        })

    } catch (error) {
        next(error);
    }
};

const getTodayAppointments = async (req, res, next) => {
    try {
        const today = normalizeDate(new Date());
        const appointments = await Appointments.find({
            appointmentDate: today
        })
            .populate("doctor", "name specialization phone consultationFee")
            .populate("patient", "name age phone gender")
            .sort({ appointmentTime: 1 });
        res.json({
            success: true,
            date: today,
            count: appointments.length,
            data: appointments
        })
    } catch (error) {
        next(error);
    }
};

const getAvailableSlots = async (req, res, next) => {
    try {
        const { doctorId } = req.params;
        const { date } = req.query;
        if (!date) {
            return res.status(400).json({
                success: false,
                message: "Date is required"
            });
        }

        const doctor = await Doctor.findById(doctorId);
        if (!doctor || !doctor.isActive) {
            return res.status(403).json({
                success: false,
                message: "Active Doctor Not Found"
            });
        }
        const selectedDate = normalizeDate(date);
        const selectedDay = getDayName(selectedDate);
        if (!doctor.availableDays.includes(selectedDay)) {
            return res.status(201).json({
                success: true,
                message: `Doctor is not available on ${selectedDay}`,
                data: []
            });
        }

        const bookedAppointments = await Appointment.find({
            doctor: doctorId,
            appointmentDate: selectedDate,
            status: {
                $ne: "Cancelled"
            }
        }).select("appointmentTime");

        const bookTimes = bookedAppointments.map(
            (appointment) => appointment.appointmentTime
        );

        const slots = [];

        let [startHour, startMinute] = doctor.startTime
            .split(":")
            .map(Number);
        let [endHour, endMinute] = doctor.endTime
            .split(":")
            .map(Number);

        let currentMinutes = startHour * 60 + startMinute;
        let endMinutes = endHour * 60 + endMinute;

        while (currentMinutes < endMinutes) {
            const hour = Math.floor(currentMinutes / 60);
            const minute = currentMinutes % 60;
            const formattedTime = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
            slots.push({
                time: formattedTime,
                available: !bookTimes.includes(formattedTime)
            });
            currentMinutes += doctor.slotDuration;
        }
        res.json({
            success: true,
            doctor: {
                id: doctor._id,
                name: doctor.name,
                slotDuration: doctor.slotDuration
            },
            date: selectedDate,
            data: slots
        })

    } catch (error) {
        next(error);
    }
};

