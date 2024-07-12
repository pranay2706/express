
const sendErrorDev = (err, res) => {
    err.message = err.message.split(':')[2]
    console.log(err.message)
    res.status(500).json({
        status: "error",
        message: err,
    })
}

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500
    err.status = err.status || 'error'
    sendErrorDev(err, res)
}