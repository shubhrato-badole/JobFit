
import express from "express";
import db from "../database.js";
import Authorization from "../middleware/authmiddelware.js";
import redis from "../lib/redies.js";

const router = express.Router();

// Search jobs with Redis caching.
router.get("/search", Authorization, async (req, res) => {
  const { q, location } = req.query;

  if (typeof q !== "string" || q.trim().length < 2) {
    return res.status(400).json({
      error: "Please enter a search term",
    });
  }

  if (location !== undefined && typeof location !== "string") {
    return res.status(400).json({
      error: "Invalid location",
    });
  }

  const query = `${q.trim()} ${location?.trim() || ""}`
    .trim()
    .toLowerCase();

  const cacheKey = `job:${query}`;

  try {
    let cached = null;
    let cacheReadSucceeded = false;

    // Try Redis first. A Redis failure should not prevent job search.
    try {
      cached = await redis.get(cacheKey);
      cacheReadSucceeded = true;
    } catch (redisError) {
      console.error(
        "[JOB CACHE GET ERROR]",
        redisError.message
      );
    }

    // Return cached results when available.
    if (cached) {
      try {
        const cachedData = JSON.parse(cached);

        console.log("[JOB CACHE HIT]");

        return res.json(cachedData);
      } catch (parseError) {
        // Invalid cached JSON should not break the search.
        console.error(
          "[JOB CACHE INVALID JSON]",
          parseError.message
        );

        cached = null;

        try {
          await redis.del(cacheKey);
        } catch (redisError) {
          console.error(
            "[JOB CACHE DELETE ERROR]",
            redisError.message
          );
        }
      }
    }

    if (cacheReadSucceeded) {
      console.log("[JOB CACHE MISS]");
    }

    // Fetch from RapidAPI on a cache miss or Redis read failure.
    const url =
      `https://jsearch.p.rapidapi.com/search` +
      `?query=${encodeURIComponent(query)}` +
      `&num_pages=2&country=us&date_posted=all`;

    const response = await fetch(url, {
      headers: {
        "x-rapidapi-host": "jsearch.p.rapidapi.com",
        "x-rapidapi-key": process.env.RAPID_API_KEY,
      },
    });

    if (!response.ok) {
      console.error(
        "[JOB SEARCH UPSTREAM ERROR]",
        response.status
      );

      return res.status(502).json({
        error: "External job search service failed",
      });
    }

    const data = await response.json();

    const jobs = (data.data || []).map((job) => ({
      id: job.job_id,
      title: job.job_title,
      company: job.employer_name,
      location: [
        job.job_city,
        job.job_state,
        job.job_country,
      ]
        .filter(Boolean)
        .join(", "),
      jobDesc: job.job_description,
      type: job.job_employment_type,
      isRemote: job.job_is_remote,
      applyUrl: job.job_apply_link,
      postedAt: job.job_posted_at_datetime_utc,
      logo: job.employer_logo || null,
      minSalary: job.job_min_salary,
      maxSalary: job.job_max_salary,
      salaryPeriod: job.job_salary_period,
    }));

    const responseData = {
      jobs,
      total: jobs.length,
    };

    // Cache writes are best-effort. Successful search results should
    // still be returned if Redis cannot store them.
    try {
      await redis.set(
        cacheKey,
        JSON.stringify(responseData),
        "EX",
        1800
      );

      console.log("[JOB CACHE STORED]");
    } catch (redisError) {
      console.error(
        "[JOB CACHE SET ERROR]",
        redisError.message
      );
    }

    return res.json(responseData);
  } catch (err) {
    console.error("[JOB SEARCH ERROR]", err.message);

    return res.status(500).json({
      error: "Failed to fetch jobs. Please try again.",
    });
  }
});

// Save a job.
router.post("/saved", Authorization, async (req, res) => {
  const {
    title,
    company,
    jobUrl,
    jobDescription,
    location,
  } = req.body;

  if (!title || !company || !jobUrl) {
    return res.status(400).json({
      error: "Title, company and job URL are required",
    });
  }

  try {
    const { rows } = await db.query(
      `SELECT *
       FROM saved_jobs
       WHERE user_id = $1 AND company = $2 AND title = $3`,
      [req.user.id, company, title]
    );

    if (rows.length > 0) {
      return res.status(409).json({
        error: "Job already saved",
      });
    }

    const result = await db.query(
      `INSERT INTO saved_jobs
        (user_id, title, company, job_desc, source_url, location)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [
        req.user.id,
        title,
        company,
        jobDescription || null,
        jobUrl,
        location || null,
      ]
    );

    return res.status(201).json({
      message: "Job saved successfully",
      id: result.rows[0].id,
    });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({
        message: "Job already saved",
      });
    }

    console.error("[SAVE JOB ERROR]", err.message);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
});

// Get the current user's saved jobs.
router.get("/saved", Authorization, async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT
         id,
         title,
         company,
         location,
         created_at,
         source_url,
         job_desc
       FROM saved_jobs
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    return res.json({
      jobs: rows,
    });
  } catch (err) {
    console.error("[GET SAVED JOBS ERROR]", err.message);

    return res.status(500).json({
      error: "Server error",
    });
  }
});

// Delete a saved job belonging to the current user.
router.delete("/:id", Authorization, async (req, res) => {
  const { id } = req.params;

  try {
    const { rows } = await db.query(
      `DELETE FROM saved_jobs
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [id, req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        error: "Saved job not found",
      });
    }

    return res.json({
      message: "Removed from saved jobs",
    });
  } catch (err) {
    console.error("[DELETE SAVED JOB ERROR]", err.message);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
});

export default router;
