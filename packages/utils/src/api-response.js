export function sendSuccess(res, data, message = "Success", statusCode = 200) {
    return res.status(statusCode).json({ success: true, message, data });
}
export function sendError(res, message = "Something went wrong", statusCode = 500, errors) {
    return res.status(statusCode).json({ success: false, message, errors });
}
//# sourceMappingURL=api-response.js.map