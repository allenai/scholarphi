type LogLevel = "error" | "warning" | "info" | "debug";

/**
 * Logger that logs events to remote server endpoint.
 * As the singleton for this logger will be initialized when the script is imported, it is
 * some component of the app is responsible for injecting the username once that
 * information becomes available by using 'setUsername'.
 */
class RemoteLogger {
  setUsername(username: string) {
    this._username = username;
  }

  setContext(context?: any) {
    this._context = context;
  }

  /**
   * To debounce an event (i.e., only log it every so often), set 'debounce' to a number of
   * milliseconds to wait before logging an event of that type. Once the wait period expires,
   * the last event of that type will be logged.
   *
   * If 'data' is a function, this function will be called to produce the data to be logged.
   * This may be useful when using 'debounce' to ensure that data that is expensive to compute
   * will only be computed when the debounce waiting time has passed.
   */
  async log(
    level: LogLevel,
    eventType?: string,
    data?: any,
    debounce?: number
  ) {
    if (eventType !== undefined && debounce !== undefined && debounce > 0) {
      /*
       * If debouncing is requested, only log the data once the interval has passed.
       * When that interval passes, log only the most recent data for the event.
       */
      if (this._debouncedData[eventType] === undefined) {
        setTimeout(() => {
          const d = this._debouncedData[eventType];
          this._debouncedData[eventType] = undefined;
          this._log(level, eventType, d);
        }, debounce);
      }
      this._debouncedData[eventType] = data;
      return;
    }

    this._log(level, eventType, data);
  }

  async _log(level: LogLevel, eventType?: string, data?: any) {
    /*
    const logData = this._prepareData(data);
    return axios
      .post("/api/log", {
        username: this._username,
        level,
        event_type: eventType,
        data: logData,
      } as LogEntryCreatePayload)
      .catch((e) => {
        if (!this._receivedPostError) {
          console.error(
            "Failed to log event with data [",
            level,
            eventType,
            data,
            "] to remote server. Check that you are connected to the internet. " +
              "This messge will not be shown again."
          );
          this._receivedPostError = true;
        }
      });
      */
  }

  private _prepareData(data: any) {
    const context = this._context || {};
    context.clientTimestamp = new Date().getTime();
    let dataWithContext = { _context: context };

    if (data) {
      const d = typeof data === "function" ? data() : data;
      dataWithContext = { ...dataWithContext, ...d };
    }
    return dataWithContext;
  }

  private _username: string | null = null;
  private _context: any;
  private _debouncedData: { [eventType: string]: any } = {};
  private _receivedPostError: boolean = false;
}

const remoteLoggerInstance = new RemoteLogger();

export default remoteLoggerInstance;

/**
 * Get remote logger singleton.
 */
export function getRemoteLogger() {
  return remoteLoggerInstance;
}
