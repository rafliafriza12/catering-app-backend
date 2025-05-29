import { Request, Response } from "express";
import Cart from "../models/Cart";

class CartController {
  public async addToCart(req: Request, res: Response): Promise<void> {
    try {
      const { mealId, quantity, price } = req.body;
      const userId = req.user!._id;

      let cart = await Cart.findOne({ userId });

      if (cart) {
        // Check if meal already exists in cart
        const itemIndex = cart.items.findIndex(
          (item) => item.mealId.toString() === mealId
        );

        if (itemIndex > -1) {
          cart.items[itemIndex].quantity += quantity;
        } else {
          cart.items.push({ mealId, quantity, price });
        }

        cart.totalAmount = cart.items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
        await cart.save();
      } else {
        cart = await Cart.create({
          userId,
          items: [{ mealId, quantity, price }],
          totalAmount: price * quantity,
        });
      }

      res.status(200).json(cart);
    } catch (error) {
      res.status(500).json({ message: "Error adding item to cart", error });
    }
  }

  public async getCart(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!._id;
      const cart = await Cart.findOne({ userId }).populate("items.mealId");

      if (!cart) {
        res.status(404).json({ message: "Cart not found" });
        return;
      }

      res.status(200).json(cart);
    } catch (error) {
      res.status(500).json({ message: "Error fetching cart", error });
    }
  }

  public async updateCartItem(req: Request, res: Response): Promise<void> {
    try {
      const { mealId, quantity } = req.body;
      const userId = req.user!._id;

      const cart = await Cart.findOne({ userId });

      if (!cart) {
        res.status(404).json({ message: "Cart not found" });
        return;
      }

      const itemIndex = cart.items.findIndex(
        (item) => item.mealId.toString() === mealId
      );

      if (itemIndex > -1) {
        cart.items[itemIndex].quantity = quantity;
        cart.totalAmount = cart.items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
        await cart.save();
        res.status(200).json(cart);
      } else {
        res.status(404).json({ message: "Item not found in cart" });
      }
    } catch (error) {
      res.status(500).json({ message: "Error updating cart item", error });
    }
  }

  public async removeFromCart(req: Request, res: Response): Promise<void> {
    try {
      const { mealId } = req.params;
      const userId = req.user!._id;

      const cart = await Cart.findOne({ userId });

      if (!cart) {
        res.status(404).json({ message: "Cart not found" });
        return;
      }

      cart.items = cart.items.filter(
        (item) => item.mealId.toString() !== mealId
      );
      cart.totalAmount = cart.items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );

      await cart.save();
      res.status(200).json(cart);
    } catch (error) {
      res.status(500).json({ message: "Error removing item from cart", error });
    }
  }

  public async clearCart(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!._id;
      await Cart.findOneAndDelete({ userId });
      res.status(200).json({ message: "Cart cleared successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error clearing cart", error });
    }
  }
}

export default new CartController();
