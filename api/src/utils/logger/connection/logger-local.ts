import { ILogger, LoggerType } from "../logger";

export class LoggerLocal implements ILogger{
    constructor() {}
    info(data: LoggerType) {
        console.info(JSON.stringify({ type: 'INFO', ...data, created_at: new Date().toISOString() }));
    };

    warn(data: LoggerType) {
        console.warn(JSON.stringify({ type: 'WARN', ...data, created_at: new Date().toISOString() }));
    };

    error(data: LoggerType) {
        console.error(JSON.stringify({ type: 'ERROR', ...data, created_at: new Date().toISOString() }));
    };
}