import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';


interface AuthenticatedRequest extends Request {
  user?: { userId: string; name: string };
}


interface JwtPayload {
  userId: string;
  name: string;
}


const authenticateUser = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const token = req.cookies.token;
  console.log(token);

  if (!token) {
    return res.status(401).json({ msg: "You are not allowed to access this route" });
  }

  try {
    const verifiedToken = jwt.verify(token, process.env.JWT_SECRET_V as string) as JwtPayload;
    console.log("VerifiedToken:",verifiedToken);

    req.user = { userId: verifiedToken.userId, name: verifiedToken.name };
    // console.log(req.user);
    next();
  } catch (error) {
    console.log("Error:",error)
    return res.status(401).json({ msg: "Invalid or expired token. Please login again." });
  }
};

// export default authenticateUser;
module.exports = {authenticateUser};

