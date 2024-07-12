const winston = require('winston');
const { combine, timestamp, printf, json } = winston.format;

const logFormat = printf(({ timestamp, level, message, error }) => {
    return `${timestamp} ${level}: ${message} ${error ? `\n${error}` : ''}`;
});


const logger = winston.createLogger({
    level: 'info',
    format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        json()
    ),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' })
    ]
});

function logErr(err) {
    const stackTrace = err.stack || '';
    logger.error(err.message, { error: stackTrace });
}

module.exports = { logErr };
