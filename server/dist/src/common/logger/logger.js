/**
 * @description
 * This class is responsible for handling all the logging throughout the application.
 **/ export class Logger {
    static _logger;
    static get logger() {
        return this._logger;
    }
    /** @internal */ static useLogger(logger) {
        Logger._logger = logger;
    }
    static info(message, context, meta) {
        Logger.logger.info(message, context, meta);
    }
    static debug(message, context, meta) {
        Logger.logger.debug(message, context, meta);
    }
    static warn(message, context, meta) {
        Logger.logger.warn(message, context, meta);
    }
    static verbose(message, context, meta) {
        Logger.logger.verbose(message, context, meta);
    }
    static error(message, context, trace, meta) {
        Logger.logger.error(message, context, trace, meta);
    }
}
