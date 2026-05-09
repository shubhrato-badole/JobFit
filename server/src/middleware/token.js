import crypto from "crypto"


const generateToken = () =>{
return crypto.randomBytes(32).toString('hex')
}

const hashToken = (token) =>{
return crypto.createHash('sha256').update(token).digest('hex')
}

export  { generateToken, hashToken }