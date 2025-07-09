import { Router } from "express";
import { z } from "zod";
import { authenticate } from "../middleware/auth";

export const paymentsRouter: Router = Router();

paymentsRouter.use(authenticate);

// Create payment intent
const createPaymentSchema = z.object({
  amount: z.number().positive(),
  currency: z.enum(["USD", "KHR"]),
  paymentMethod: z.enum(["aba_payway", "wing_money"]),
  description: z.string(),
});

paymentsRouter.post("/create-intent", async (req, res) => {
  const _userId = req.userId;
  const data = createPaymentSchema.parse(req.body);

  // TODO: Integrate with payment providers
  // For now, return mock data
  res.json({
    paymentIntentId: "pi_" + Math.random().toString(36).substr(2, 9),
    amount: data.amount,
    currency: data.currency,
    status: "pending",
    clientSecret: "secret_" + Math.random().toString(36).substr(2, 9),
  });
});

// Confirm payment
paymentsRouter.post("/confirm/:paymentIntentId", async (req, res) => {
  const { paymentIntentId } = req.params;

  // TODO: Confirm with payment provider
  res.json({
    paymentIntentId,
    status: "succeeded",
    confirmedAt: new Date(),
  });
});

// Get payment history
paymentsRouter.get("/history", async (req, res) => {
  const _userId = req.userId;

  // TODO: Fetch from database
  const payments = [
    {
      id: "1",
      amount: 10,
      currency: "USD",
      status: "succeeded",
      description: "Monthly subscription",
      createdAt: new Date(),
    },
  ];

  res.json(payments);
});