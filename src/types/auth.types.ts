import { Document } from "mongoose";

export interface TAuth extends Document {
  _id: any;
  email: string;
  fullName: string;
  phone: string;
  password: string;
  token: string;
  createdAt: Date;
  updateAt: Date;
  __v: any;
}

export interface JwtPayload {
  _id: string;
  email: string;
}

export type PickRegister = Pick<TAuth, "email" | "fullName" | "password">;
export type PickLogin = Pick<TAuth, "email" | "password">;
export type PickLogout = Pick<TAuth, "_id">;
export type PickGetUser = Pick<TAuth, "_id">;
