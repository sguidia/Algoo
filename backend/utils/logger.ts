import { createLogger, transports, format, Logger} from "winston";
import moment from "moment";
import {Request} from "express";

const OPTIONS = {
    console: {
        handleExceptions: true,
        level: 'debug',
        format: format.combine(
            format.timestamp(),
            format.colorize(),
            format.printf(({ timestamp, level, message }) => {
                return `[${timestamp}] ${level}: ${message}`;
            })
        )
    },
    verbose: {
        filename: `./logs/logs-${moment().format('YYYYMMDD_HH')}.log`,
        level: 'debug',
        format: format.combine(
            format.timestamp(),
            format.printf(({ timestamp, level, message }) => {
                return `[${timestamp}] ${level}: ${message}`;
            })
        )
    },
}

/**
 * @description Winston logger instance
 */
export const LOGGER : Logger = createLogger({
    transports: [
        new transports.Console(OPTIONS.console),
        new transports.File(OPTIONS.verbose)],
    format: format.combine(

    )
})

/**
 * @description Get the IP of the request
 * @param req Express Request
 */
export function getIP(req: Request){
    return req.headers['x-forwarded-for'] || req.socket.remoteAddress;
}