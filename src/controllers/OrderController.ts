import { Request, Response } from "express";
import Order from "../models/Order";
import Cart from "../models/Cart";

class OrderController {
  public async createOrder(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!._id;
      const { shippingAddress, paymentMethod } = req.body;

      // Get user's cart
      const cart = await Cart.findOne({ userId });
      if (!cart || cart.items.length === 0) {
        res.status(400).json({ message: "Cart is empty" });
        return;
      }

      // Create order from cart
      const order = await Order.create({
        userId,
        items: cart.items,
        totalAmount: cart.totalAmount,
        shippingAddress,
        paymentMethod,
        status: "pending",
        paymentStatus: "pending",
      });

      // Clear the cart after order creation
      await Cart.findOneAndDelete({ userId });

      res.status(201).json(order);
    } catch (error) {
      res.status(500).json({ message: "Error creating order", error });
    }
  }

  public async getOrders(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!._id;
      const orders = await Order.find({ userId })
        .populate("items.mealId")
        .sort({ createdAt: -1 });

      res.status(200).json(orders);
    } catch (error) {
      res.status(500).json({ message: "Error fetching orders", error });
    }
  }

  public async getOrderById(req: Request, res: Response): Promise<void> {
    try {
      const { orderId } = req.params;
      const userId = req.user!._id;

      const order = await Order.findOne({ _id: orderId, userId }).populate(
        "items.mealId"
      );

      if (!order) {
        res.status(404).json({ message: "Order not found" });
        return;
      }

      res.status(200).json(order);
    } catch (error) {
      res.status(500).json({ message: "Error fetching order", error });
    }
  }

  public async updateOrderStatus(req: Request, res: Response): Promise<void> {
    try {
      const { orderId } = req.params;
      const { status } = req.body;
      const userId = req.user!._id;

      const order = await Order.findOne({ _id: orderId, userId });

      if (!order) {
        res.status(404).json({ message: "Order not found" });
        return;
      }

      order.status = status;
      await order.save();

      res.status(200).json(order);
    } catch (error) {
      res.status(500).json({ message: "Error updating order status", error });
    }
  }

  public async cancelOrder(req: Request, res: Response): Promise<void> {
    try {
      const { orderId } = req.params;
      const userId = req.user!._id;

      const order = await Order.findOne({ _id: orderId, userId });

      if (!order) {
        res.status(404).json({ message: "Order not found" });
        return;
      }

      if (order.status === "completed") {
        res.status(400).json({ message: "Cannot cancel completed order" });
        return;
      }

      order.status = "cancelled";
      await order.save();

      res.status(200).json(order);
    } catch (error) {
      res.status(500).json({ message: "Error cancelling order", error });
    }
  }
}

export default new OrderController();
