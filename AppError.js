class AppError extends Error {
    constructor(msg, status) {
        super();
        this.message = msg;
        this.status = status;
    }
}

module.exports = AppError;