
export default function responseTime(req, res, next) {
  const start = process.hrtime.bigint();
  const requestPath = req.originalUrl.split("?")[0];

  res.once("finish", () => {
    if (
      requestPath !== "/api/jobs/search" &&
      requestPath !== "/api/ai/analyze"
    ) {
      return;
    }

    const durationMs =
      Number(process.hrtime.bigint() - start) / 1e6;

    console.log(
      `[PERFORMANCE] ${req.method} ${requestPath}` +
      ` | status=${res.statusCode}` +
      ` | duration=${durationMs.toFixed(2)}ms`
    );
  });

  next();
}
