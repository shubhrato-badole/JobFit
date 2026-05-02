import express from "express";
import db from "../database.js";
import Authorization from "../middleware/authmiddelware.js";


const router = express.Router();


router.get("/search", Authorization, async (req, res) => {
    const { q, location } = req.query

    if (!q || q.trim().length < 2) {
        return res.status(400).json({
            error: 'Please enter a search term'
        })
    }

    try {
        const query = ` ${q.trim()} ${location?.trim() || ''}`.trim()

        const url = `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(query)}&num_pages=2&country=us&date_posted=all`;

        const response = await fetch(url, {
            headers: {
                'x-rapidapi-host': 'jsearch.p.rapidapi.com',
                'x-rapidapi-key': process.env.RAPID_API_KEY,
            }
        });

        console.log("STATUS:", response.status);
        const data = await response.json();
          
          
             if (!response.ok) {
               return res.status(response.status).json({
                error: data?.message || 'External API failed'
               });
        }




        const jobs = (data.data || []).map(job => ({
            id: job.job_id,
            title: job.job_title,
            company: job.employer_name,
            location: [job.job_city, job.job_state, job.job_country].filter(Boolean).join(', '),
            jobDesc: job.job_description,
            type: job.job_employment_type,
            isRemote: job.job_is_remote,
            applyUrl: job.job_apply_link,
            postedAt: job.job_posted_at_datetime_utc,
            logo: job.employer_logo || null,
            minSalary: job.job_min_salary,
            maxSalary: job.job_max_salary,
            salaryPeriod: job.job_salary_period,
        }))

        res.json({ jobs, total: jobs.length })

    } catch (err) {
        
        console.log("REAL API ERROR:", err.message)
        return res.status(response.status).json({
            error: data?.message || 'External API failed'
        })
    }
})


router.post("/saved", Authorization, async (req, res) => {
    const { title, company, jobUrl, jobDescription, location } = req.body

    console.log(title, company, jobUrl, jobDescription, location)
    if (!title || !company || !jobUrl) {
        return res.status(400).json({ error: 'Title, company and job URL are required' })
    }


    try {
        const { rows } = await db.query(`SELECT * FROM saved_jobs WHERE 
            user_id=$1 AND company=$2 AND title=$3`,
            [req.user.id, company, title])
     
       


        if (rows.length > 0) {
            return res.status(409).json({ error: 'Job already saved' })
        }


        const { data } = await db.query(`INSERT INTO saved_jobs
        (user_id , title ,company , job_desc , source_url, location) 
        VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
            [req.user.id, title, company, jobDescription || null, jobUrl || null, location || null])
        

        
            res.status(201).json({
            message: 'Job saved successfully',
            id: data.rows[0].id
        })


    } catch (err) {
  
        if (err.code === "23505") { // PostgreSQL duplicate key
    return res.status(409).json({ message: "Job already saved" });
  }
        console.error(err)
        return res.status(500).json({ error: 'Internal server error' })
    }

})




router.get("/saved", Authorization, async (req, res) => {

    try {
        const { rows } = await db.query(`SELECT  id ,title , company , location , created_at ,source_url
         FROM saved_jobs WHERE user_id=$1 `, [req.user.id])
       
        if (rows.length === 0) {
            return res.status(400).json({
                error: "you havent saved any jobs"
            })
        }
        res.json({ jobs: rows })
    } catch (err) {
        res.status(500).json({ error: 'Server error' })
    }



})






router.delete('/delete/:id', Authorization, async (req, res) => {
    const { id } = req.params
    console.log(id)
    try {


        const { rows } = await db.query(`DELETE FROM saved_jobs
             WHERE id=$1 AND user_id=$2 RETURNING id`, [id, req.user.id])


        if (rows.length === 0) {
            return res.status(404).json({ error: 'Saved job not found' })
        }
        res.json({ message: 'Removed from saved jobs' })
    }
    catch (err) {
        console.error(err)
        return res.status(500).json({ error: 'Internal server error' })
    }
})
export default router