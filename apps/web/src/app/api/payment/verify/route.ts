import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@plp/database";

// Plan configurations
const PLAN_CONFIGS = {
  monthly: {
    duration: 30, // days
    name: "Monthly Plan",
  },
  yearly: {
    duration: 365, // days
    name: "Yearly Plan",
  },
  lifetime: {
    duration: 36500, // 100 years (effectively lifetime)
    name: "Lifetime Access",
  },
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentId, transactionId, status, provider } = body;

    if (!paymentId) {
      return NextResponse.json(
        { error: "Payment ID is required" },
        { status: 400 }
      );
    }

    // Get payment record
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        user: true,
      },
    });

    if (!payment) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

    // In production, verify with payment provider API
    // For demo, we'll simulate verification
    const isVerified = status === "success" || status === "completed";

    if (isVerified) {
      // Update payment status
      await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: "COMPLETED",
          transactionId: transactionId || payment.transactionId,
          completedAt: new Date(),
        },
      });

      // Get plan details from metadata
      const metadata = payment.metadata as any;
      const planId = metadata?.planId || "monthly";
      const planConfig = PLAN_CONFIGS[planId as keyof typeof PLAN_CONFIGS];

      // Calculate subscription dates
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + planConfig.duration);

      // Check if user has existing subscription
      const existingSubscription = await prisma.subscription.findUnique({
        where: { userId: payment.userId },
      });

      if (existingSubscription) {
        // Update existing subscription
        await prisma.subscription.update({
          where: { userId: payment.userId },
          data: {
            plan: planConfig.name,
            status: "ACTIVE",
            startDate,
            endDate,
            lastPaymentId: payment.id,
          },
        });
      } else {
        // Create new subscription
        await prisma.subscription.create({
          data: {
            userId: payment.userId,
            plan: planConfig.name,
            status: "ACTIVE",
            startDate,
            endDate,
            lastPaymentId: payment.id,
          },
        });
      }

      // Create transaction log
      await prisma.transaction.create({
        data: {
          userId: payment.userId,
          type: "SUBSCRIPTION",
          amount: payment.amount,
          currency: payment.currency,
          status: "SUCCESS",
          description: `${planConfig.name} subscription`,
          paymentId: payment.id,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Payment verified and subscription activated",
        subscriptionEndDate: endDate.toISOString(),
      });
    } else {
      // Payment failed
      await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: "FAILED",
          failedAt: new Date(),
          metadata: {
            ...payment.metadata as any,
            failureReason: "Payment verification failed",
          },
        },
      });

      // Create failed transaction log
      await prisma.transaction.create({
        data: {
          userId: payment.userId,
          type: "SUBSCRIPTION",
          amount: payment.amount,
          currency: payment.currency,
          status: "FAILED",
          description: "Failed subscription payment",
          paymentId: payment.id,
        },
      });

      return NextResponse.json({
        success: false,
        error: "Payment verification failed",
      });
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 500 }
    );
  }
}