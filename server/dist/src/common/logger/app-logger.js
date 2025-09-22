/**
 * @description
 * An enum of valid logging levels.
 *
 * @docsCategory Logger
 */ export var LogLevel = /*#__PURE__*/ function(LogLevel) {
    /**
   * @description
   * Log Errors only. These are usually indicative of some potentially
   * serious issue, so should be acted upon.
   */ LogLevel[LogLevel["Error"] = 0] = "Error";
    /**
   * @description
   * Warnings indicate that some situation may require investigation
   * and handling. But not as serious as an Error.
   */ LogLevel[LogLevel["Warn"] = 1] = "Warn";
    /**
   * @description
   * Logs general information such as startup messages.
   */ LogLevel[LogLevel["Info"] = 2] = "Info";
    /**
   * @description
   * Logs additional information
   */ LogLevel[LogLevel["Verbose"] = 3] = "Verbose";
    /**
   * @description
   * Logs detailed info useful in debug scenarios, including stack traces for
   * all errors. In production this would probably generate too much noise.
   */ LogLevel[LogLevel["Debug"] = 4] = "Debug";
    return LogLevel;
}({});
