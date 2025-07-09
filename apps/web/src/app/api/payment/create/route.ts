import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@plp/database";
import crypto from "crypto";

// Mock payment provider configurations
const PAYWAY_CONFIG = {
  merchantId: process.env.PAYWAY_MERCHANT_ID || "DEMO_MERCHANT",
  apiKey: process.env.PAYWAY_API_KEY || "demo_key",
  baseUrl: process.env.PAYWAY_BASE_URL || "https://sandbox.payway.com.kh",
};

const WING_CONFIG = {
  partnerId: process.env.WING_PARTNER_ID || "DEMO_PARTNER",
  secretKey: process.env.WING_SECRET_KEY || "demo_secret",
  baseUrl: process.env.WING_BASE_URL || "https://sandbox.wing.com.kh",
};

export async function POST(request: NextRequest) {
  try {
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { planId, amount, currency, paymentMethod } = body;

    // Validate input
    if (!planId || !amount || !currency || !paymentMethod) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        userId: user.id,
        amount,
        currency,
        method: paymentMethod.toUpperCase(),
        status: "PENDING",
        description: `Subscription plan: ${planId}`,
        metadata: {
          planId,
          paymentMethod,
        },
      },
    });

    // Generate payment URL based on provider
    let paymentUrl = "";
    
    if (paymentMethod === "payway") {
      // PayWay integration
      const transactionId = `TXN_${payment.id}`;
      const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL}/payment/callback`;
      
      // In production, this would make an API call to PayWay
      // For demo, we'll create a mock URL
      const params = new URLSearchParams({
        merchant_id: PAYWAY_CONFIG.merchantId,
        transaction_id: transactionId,
        amount: amount.toString(),
        currency,
        return_url: returnUrl,
        payment_id: payment.id,
      });
      
      paymentUrl = `${PAYWAY_CONFIG.baseUrl}/checkout?${params}`;
      
    } else if (paymentMethod === "wing") {
      // Wing Money integration
      const orderId = `ORDER_${payment.id}`;
      const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/payment/callback`;
      
      // In production, this would make an API call to Wing
      // For demo, we'll create a mock URL
      const params = new URLSearchParams({
        partner_id: WING_CONFIG.partnerId,
        order_id: orderId,
        amount: amount.toString(),
        currency,
        callback_url: callbackUrl,
        payment_id: payment.id,
      });
      
      paymentUrl = `${WING_CONFIG.baseUrl}/pay?${params}`;
    }

    // Update payment with transaction details
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        transactionId: payment.id,
        metadata: {
          ...payment.metadata as any,
          paymentUrl,
        },
      },
    });

    return NextResponse.json({
      paymentId: payment.id,
      paymentUrl,
      amount,
      currency,
    });
  } catch (error) {
    console.error("Error creating payment:", error);
    return NextResponse.json(
      { error: "Failed to create payment" },
      { status: 500 }
    );
  }
}