
import { Connection, ConnectionProtocol } from "data-format";

export function protocolAsString(connection: Connection): string {
    switch (connection.protocol) {
        case ConnectionProtocol.HTTP2:
            if (connection.tls) {
                return "HTTPS/2";
            } else {
                return "HTTP/2";
            }
        case ConnectionProtocol.HTTP1:
            if (connection.tls) {
                return "HTTPS/1.1";
            } else {
                return "HTTP/1.1";
            }
    }
}
