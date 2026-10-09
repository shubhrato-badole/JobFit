import http from "k6/http";
import { check } from "k6";

const BASE_URL = __ENV.BASE_URL || "https://api.jobsfit.in";
const COOKIE = __ENV.COOKIE;

if (!COOKIE) {
  throw new Error("Missing COOKIE environment variable");
}

export const options = {
  vus: Number(__ENV.VUS || 1),
  iterations: Number(__ENV.ITERATIONS || 10),

  summaryTrendStats: [
    "avg", "min", "med", "max",
    "p(90)", "p(95)", "p(99)"
  ],

  thresholds: {
    http_req_failed: ["rate<0.05"],
    checks: ["rate>0.95"]
  }
};

export default function () {
  const response = http.get(
    `${BASE_URL}/api/jobs/search?q=backend%20developer`,
    {
      headers: {
        Cookie: COOKIE,
        Accept: "application/json"
      },
      tags: {
        endpoint: "job-search"
      }
    }
  );

  check(response, {
    "HTTP status is 200": (r) => r.status === 200
  });

  if (response.status !== 200) {
    console.error(`Request failed: HTTP ${response.status}`);
  }
}
