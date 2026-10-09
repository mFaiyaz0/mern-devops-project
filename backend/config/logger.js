const winston = require("winston");
const Transport = require("winston-transport");
const net = require("net");

class LogstashTransport extends Transport {
  constructor(opts = {}) {
    super(opts);

    this.host = opts.host || "logstash";
    this.port = opts.port || 5000;
  }

  log(info, callback) {
    setImmediate(() => {
      this.emit("logged", info);
    });

    const socket = new net.Socket();

    const logData = {
      "@timestamp": new Date().toISOString(),
      level: info.level,
      message: info.message,
      ...info
    };

    socket.connect(this.port, this.host, () => {
      socket.write(JSON.stringify(logData) + "\n");
      socket.end();
    });

    socket.on("error", (error) => {
      console.error("Logstash connection error:", error.message);
    });

    if (callback) {
      callback();
    }
  }
}

const logger = winston.createLogger({
  level: "info",

  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),

  transports: [
    new winston.transports.Console(),

    new LogstashTransport({
      host: "logstash",
      port: 5000
    })
  ]
});

module.exports = logger;