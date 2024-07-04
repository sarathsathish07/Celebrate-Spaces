import jwt from 'jsonwebtoken'

const generateHotelierToken = (res,userId)=>{
  const token = jwt.sign({userId}, process.env.JWT_SECRET_HOTELIER,{
    expiresIn:"30d",
  })

  res.cookie('jwtHotelier', token, {
    httpOnly: true,  
    secure: process.env.NODE_ENV !== 'development',  
    sameSite: 'strict',  
    maxAge: 30 * 24 * 60 * 60 * 1000,  
  })
}

export default generateHotelierToken