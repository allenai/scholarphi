import axios from "axios";
import { LogEntryCreatePayload } from "./types/api";

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

  async log(level: LogLevel, eventType?: any, data?: any) {
    return axios
      .post("/api/log", {
        username: this._username,
        level,
        event_type: eventType,
        data,
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
  }

  private _username: string | null = null;
  private _receivedPostError: boolean = false;
}

const remoteLoggerInstance = new RemoteLogger();

/**
 * Get remote logger singleton.
 */
export function getRemoteLogger() {
  return remoteLoggerInstance;
}
