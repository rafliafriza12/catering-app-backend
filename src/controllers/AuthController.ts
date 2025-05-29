import { Request, Response } from "express";
import Auth from "../models/Auth";
import {
  TAuth,
  PickLogin,
  PickRegister,
  JwtPayload,
  PickLogout,
  PickGetUser,
} from "../types/auth.types";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

class AuthController {
  public async register(req: Request, res: Response): Promise<void> {
    try {
      const auth: PickRegister = req.body as PickRegister;

      if (!auth.email || !auth.fullName || !auth.password) {
        res.status(400).json({
          status: 400,
          message: "All fields are required",
        });
        return;
      }

      const isAlreadyRegistered: TAuth | null = await Auth.findOne({
        email: auth.email,
      });

      if (isAlreadyRegistered) {
        res.status(400).json({
          status: 400,
          message: "This email is already registered, try another email",
        });
        return;
      }

      const hash = await bcryptjs.hash(auth.password, 10);
      const newAuth = new Auth({
        email: auth.email,
        fullName: auth.fullName,
        password: hash,
      });

      await newAuth.save();

      res.status(201).json({
        status: 200,
        data: newAuth,
        message: "Account successfully registered",
      });
    } catch (error) {
      res.status(500).json({
        status: 500,
        message: "Internal server error",
      });
    }
  }

  public async login(req: Request, res: Response): Promise<void> {
    try {
      const auth: PickLogin = req.body as PickLogin;

      if (!auth.email || !auth.password) {
        res.status(400).json({
          status: 400,
          message: "All fields are required",
        });
        return;
      }

      const isAuthExist: TAuth | null = await Auth.findOne({
        email: auth.email,
      });

      if (!isAuthExist) {
        res.status(404).json({
          status: 404,
          message: "Account not found",
        });
        return;
      }

      const validateAuth = await bcryptjs.compare(
        auth.password,
        isAuthExist.password
      );

      if (!validateAuth) {
        res.status(400).json({
          status: 400,
          message: "Wrong email or password",
        });
        return;
      }

      const payload: JwtPayload = {
        _id: isAuthExist._id,
        email: isAuthExist.email,
      };

      if (!process.env.JWT_SECRET) {
        console.error("JWT_SECRET is not defined in environment variables");
        res.status(500).json({
          status: 500,
          message: "Server configuration error",
        });
        return;
      }

      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });

      isAuthExist.token = token;
      await isAuthExist.save();

      res.status(200).json({
        status: 200,
        data: isAuthExist,
        message: "Login successful",
      });
    } catch (error) {
      res.status(500).json({
        status: 500,
        message: "Internal server error",
      });
    }
  }

  public async getUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!._id;
      const auth: TAuth | null = await Auth.findById(userId);

      if (!auth) {
        res.status(404).json({
          status: 404,
          message: "User not found",
        });
        return;
      }

      res.status(200).json({
        status: 200,
        data: auth,
        message: "User Found",
      });
    } catch (error) {
      res.status(500).json({
        status: 500,
        message: "Internal Server Error",
      });
    }
  }

  public async logout(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!._id;
      const auth: TAuth | null = await Auth.findById(userId);

      if (!auth) {
        res.status(404).json({
          status: 404,
          message: "Account not found",
        });
        return;
      }

      auth.token = "";
      await auth.save();

      res.status(200).json({
        status: 200,
        message: "Logout successful",
      });
    } catch (error) {
      res.status(500).json({
        status: 500,
        message: "Internal server error",
      });
    }
  }
}

export default new AuthController();
