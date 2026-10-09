
export default function responseTime(req, res, next) {
  const start = process.hrtime.bigint();

  res.on("finish", () => {
    const durationMs =
      Number(process.hrtime.bigint() - start) / 1e6;

    const path = req.originalUrl.split("?")[0];

    if (
      path === "/api/ai/analyze" ||
      path === "/api/jobs/search"
    ) {
      console.log(
        `[PERFORMANCE] ${req.method} ${path} | ` +
        `${res.statusCode} | ${durationMs.toFixed(2)} ms`
      );
    }
  });

  next();
}
