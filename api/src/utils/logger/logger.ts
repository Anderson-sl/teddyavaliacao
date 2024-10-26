export interface ILogger  {
    info: (data: LoggerType) => void;
    warn: (data: LoggerType) => void;
    error: (data: LoggerType) => void;
}

export type LoggerType = {
    description: String;
    user?: {
        id: number|null;
        name: String|null;
        email: String|null;
    };
    error?: Error;
}

export class Logger {
    private logger: ILogger;
    constructor({ logger }) {
        this.logger = logger;
    }

    info(data: LoggerType) {
        this.logger.info(data);
    }

    warn(data: LoggerType) {
        this.logger.warn(data);
    }

    error(data: LoggerType) {
        this.logger.error(data);
    }
}