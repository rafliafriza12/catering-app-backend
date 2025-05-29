import express, { Application, Request, Response } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import authRouter from "./routes/AuthRouter";
import MealRouter from "./routes/MealRouter";
import CartRouter from "./routes/CartRouter";
import FavoritRouter from "./routes/FavoriteRouter";
import OrderRouter from "./routes/OrderRouter";

class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.middlewares();
    this.routes();
  }

  private middlewares(): void {
    this.app.use(cors({ origin: "*", optionsSuccessStatus: 200 }));
    this.app.use(express.urlencoded({ extended: false }));
    this.app.use(bodyParser.json());
    this.app.use(express.json());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use("/api/auth", authRouter);
    this.app.use("/api/meals", MealRouter);
    this.app.use("/api/cart", CartRouter);
    this.app.use("/api/favorit", FavoritRouter);
    this.app.use("/api/order", OrderRouter);
  }

  private routes(): void {
    this.app.get("/", (req: Request, res: Response) => {
      res.json({
        message: "Hello World with TypeScript!",
        timestamp: new Date().toISOString(),
      });
    });
  }
}

export default new App().app;
