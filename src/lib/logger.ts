import pino from "pino";

const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  // Hanya gunakan JSON transport di production/Docker.
  // Di development, pino-pretty bisa ditambahkan via NODE_OPTIONS.
  ...(process.env.NODE_ENV === "production" && {
    formatters: {
      level: (label) => ({ level: label }),
    },
  }),
  base: {
    service: "ss-app",
    env: process.env.NODE_ENV,
  },
});

export default logger;
