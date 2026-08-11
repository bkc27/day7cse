const errorHandler = (error, req, res, next) => {
    console.log(error);
    if (error.name === "CastError") {
        return res.status(400).json({
            success: false,
            message: "Invalid ID Provided"
        });
    }
    if (error.code === 11000) {
        const duplicateField = Object.keys(error.keyPattern || {}).join(", ");
        return res.status(409).json({
            success: false,
            message: `Duplicate value found for ${duplicateField}`
        });
    }
    if (error.name === "ValidationError") {
        const messages = Object.values(error.errors).map((item) => { item.message });
        return res.status(400).json({
            success: false,
            message: messages.join(", ")
        })
    }
    res.status(500).json({
        success: false,
        message: error.message || "Internal Server Error"
    });
};

module.exports = errorHandler;
