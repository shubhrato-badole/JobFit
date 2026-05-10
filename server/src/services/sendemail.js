import nodemailer from "nodemailer"


const transporter = nodemailer.createTransport({
host: 'smtp.gmail.com',
  port: 465,
  secure: true,   
auth:{
user:process.env.EMAIL_USER,
pass:process.env.EMAIL_PASS,
},
connectionTimeout: 10000,
})


const sendEmail = async({to , subject , html })=>{

    try{
        await transporter.sendMail ({
          from : `"JobFit" <${process.env.EMAIL_USER}>`,
          to,
          subject,
          html
        })

        return true 

    }catch(err){
    console.error('Email send  failed', err )
    return false 
    }

}

const sendVerificationEmail = async( user,  token) => {
    const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`

       
      const html = `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;background:#fff">
 
        <div style="text-align:center;margin-bottom:28px">
          <h1 style="font-size:22px;font-weight:700;color:#111827;margin:0">
            Job<span style="color:#2563eb">Fit</span>
          </h1>
        </div>
 
        <h2 style="font-size:18px;font-weight:600;color:#111827;margin-bottom:8px">
          Verify your email address
        </h2>
 
        <p style="font-size:14px;color:#6b7280;line-height:1.6;margin-bottom:24px">
          Hi ${user.name}, thanks for signing up!
          Click the button below to verify your email and activate your account.
        </p>
 
        <div style="text-align:center;margin-bottom:28px">
          <a href="${verifyUrl}"
             style="display:inline-block;background:#111827;color:#ffffff;
                    font-size:14px;font-weight:600;padding:12px 32px;
                    border-radius:10px;text-decoration:none">
            Verify email address
          </a>
        </div>
 
        <p style="font-size:12px;color:#9ca3af;margin-bottom:8px;text-align:center">
          Or copy this link into your browser:
        </p>
        <p style="font-size:12px;color:#2563eb;word-break:break-all;
                  text-align:center;margin-bottom:24px">
          ${verifyUrl}
        </p>
 
        <div style="border-top:1px solid #f3f4f6;padding-top:16px">
          <p style="font-size:12px;color:#9ca3af;text-align:center;margin:0">
            This link expires in 24 hours.
            If you did not create a JobFit account, ignore this email.
          </p>
        </div>
 
      </div> 
  ` ;
await sendEmail({
    to: user.email,
    subject: 'Verify your JobFit account',
    html,
})
  return true
}

const sendEmailResetPassword = async (user , token) => {
 const resetUrl = `${process.env.CLIENT_URL}/forgot-password?token=${token}`

 const html = `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #111827; margin-bottom: 8px;">Reset your password</h2>
          <p style="color: #6b7280; margin-bottom: 24px;">
            Hi ${user.name}, you requested a password reset for your JobFit account.
            Click the button below to set a new password.
          </p>
          <a href="${resetUrl}"
             style="background: #111827; color: white; padding: 12px 24px;
                    border-radius: 10px; text-decoration: none; font-weight: 600;
                    display: inline-block; margin-bottom: 24px;">
            Reset password
          </a>
          <p style="color: #9ca3af; font-size: 13px;">
            This link expires in 1 hour. If you did not request this, ignore this email.
          </p>
          <p style="color: #9ca3af; font-size: 12px; margin-top: 16px;">
            Or copy this link: ${resetUrl}
          </p>
        </div>

      ` ;


await sendEmail({
    to: user.email,
    subject: 'Reset your JobFit password',
    html,
})
return true

}


export  {sendVerificationEmail , sendEmailResetPassword}