import rateLimit from "express-rate-limit"

  const RateLimit = rateLimit({
windowMs:15 * 60 * 1000,
max:10,
handler:(req, res ) =>{
    res.status(429).json({
            success: false,                 
    message: "Too many requests from this IP, please try again later."
    })
}
})

export default RateLimit