import * as Sentry from "@sentry/node";

const dsn = process.env.SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV ?? "development",
    // 10% of requests traced — enough for latency data without volume cost.
    tracesSampleRate: 0.1,
  });
}

export { Sentry };
