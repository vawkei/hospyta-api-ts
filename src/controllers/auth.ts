import { Request, Response } from "express";
import User from "../models/User";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// register===========================================================================
export const register = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400).json({ msg: "Input fields shouldn't be empty" });
    return;
  }

  if (password.length < 6) {
    res.status(400).json({ msg: "Password should be at least 6 characters" });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const userData = {
    name,
    email,
    password: hashedPassword,
    isRegistered: true,
  };

  try {
    await User.create(userData);
    res.status(201).json({ msg: "Please login" });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// login============================================================================
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ msg: "Input fields shouldn't be empty" });
    return;
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ msg: "User doesn't exist" });
      return;
    }

    if (!user.isRegistered) {
      res.status(401).json({ msg: "Please verify your email" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ msg: "Invalid password" });
      return;
    }

    const token = jwt.sign(
      { userId: user._id, name: user.name },
      process.env.JWT_SECRET_V!,
      { expiresIn: process.env.JWT_LIFETIME }
    );

    const oneDay = 1000 * 60 * 60 * 24;
    res.cookie("token", token, {
      path: "/",
      httpOnly: true,
      expires: new Date(Date.now() + oneDay),
      secure: true,
      sameSite: "none",
    });

    res.status(201).json({
      msg: "User logged in",
      user: { _id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// logout==============================================================================
export const logout = (req: Request, res: Response)=> {
  res.cookie("token", "", {
    path: "/",
    httpOnly: true,
    expires: new Date(0),
    secure: true,
    sameSite: "none",
  });
  res.status(200).json({ msg: "User logged out successfully" });
};

