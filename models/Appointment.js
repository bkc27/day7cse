const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
    appointmentNumber: {
        type: String,
        unique: true,
        required: true
    },
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Doctor",
        requried: true
    },
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient",
        required: true
    },
    appointmentDate: {
        type: Date,
        required: true
    },
    appointmentTime: {
        type: String,
        required: true
    },
    reason: {
        type: String,
        required: true,
        trim: true
    },
    symptoms: [{
        type: String,
        trim: true
    }],
    status: {
        type: String,
        enum: ["Pending", "Confirmed", "Checked-In", "Completed", "Cancelled"],
        default: "Pending"
    },
    bookingType: {
        type: String,
        enum: ["Online", "Walk-in", "Phone"]
    },
    paymentStatus: {
        type: String,
        enum: ["Pending", "Paid", "Refunded"],
        default: "Pending"
    },
    consulationFee: {
        type: Number,
        required: true
    },
    tokenNumber: {
        type: Number
    },
    notes: {
        type: String,
        trim: true
    },
    cancellationReason: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

appointmentSchema.index({
    doctor: 1,
    appointmentDate: 1,
    appointmentTime: 1,
},
    {
        unique: true,
        partialFilterExpression: {
            status: {
                $nin: ["Cancelled"]
            }
        }
    }
);

module.exports = mongoose.model("Appointment", appointmentSchema);