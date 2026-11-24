const SENSITIVE_KEYS = new Set([
  "password",
  "passwordhash",
  "passwordconfirmation",
  "currentpassword",
  "newpassword",
  "token",
  "tokenhash",
  "sessiontoken",
  "secret",
  "key",
  "apikey",
  "apisecret",
  "privatekey",
  "twofactorsecret",
  "twofactorrecoverycodes",
  "totpcode",
  "recoverycode",
  "otpauthurl",
  "email",
  "authorization",
  "cookie",
]);

function sanitizeMeta(meta) {
  if (!meta || typeof meta !== "object") return meta;
  if (Array.isArray(meta)) return meta.map(sanitizeMeta);

  const sanitized = {};
  for (const [key, value] of Object.entries(meta)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) {
      sanitized[key] = "[REDACTED]";
    } else if (value && typeof value === "object") {
      sanitized[key] = sanitizeMeta(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

function writeLog(level, message, meta = undefined) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(meta !== undefined ? { meta: sanitizeMeta(meta) } : {}),
  };

  const output = JSON.stringify(entry);
  if (level === "error") {
    console.error(output);
  } else if (level === "warn") {
    console.warn(output);
  } else {
    console.log(output);
  }
}

export const logger = {
  info(message, meta) {
    writeLog("info", message, meta);
  },
  warn(message, meta) {
    writeLog("warn", message, meta);
  },
  error(message, meta) {
    writeLog("error", message, meta);
  },
  debug(message, meta) {
    if (process.env.NODE_ENV !== "production") {
      writeLog("debug", message, meta);
    }
  },
};
