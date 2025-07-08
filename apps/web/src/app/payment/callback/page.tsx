"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function PaymentCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"processing" | "success" | "failed">("processing");
  const [message, setMessage] = useState("Processing your payment...");

  useEffect(() => {
    handlePaymentCallback();
  }, [searchParams]);

  const handlePaymentCallback = async () => {
    try {
      // Get payment details from URL params
      const paymentId = searchParams.get("payment_id");
      const transactionId = searchParams.get("transaction_id");
      const status = searchParams.get("status");
      const provider = searchParams.get("provider");

      if (!paymentId) {
        setStatus("failed");
        setMessage("Invalid payment callback");
        return;
      }

      // Verify payment with backend
      const response = await fetch("/api/payment/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentId,
          transactionId,
          status,
          provider,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatus("success");
        setMessage("Payment successful! Your subscription is now active.");
        
        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          router.push("/dashboard");
        }, 3000);
      } else {
        setStatus("failed");
        setMessage(data.error || "Payment verification failed");
      }
    } catch (error) {
      console.error("Error processing payment callback:", error);
      setStatus("failed");
      setMessage("An error occurred while processing your payment");
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "processing":
        return <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />;
      case "success":
        return <CheckCircle className="w-16 h-16 text-green-600" />;
      case "failed":
        return <XCircle className="w-16 h-16 text-red-600" />;
    }
  };

  const getStatusTitle = () => {
    switch (status) {
      case "processing":
        return "Processing Payment";
      case "success":
        return "Payment Successful!";
      case "failed":
        return "Payment Failed";
    }
  };

  return (
    <div className="container max-w-2xl mx-auto py-16 px-4">
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {getStatusIcon()}
          </div>
          <CardTitle className="text-2xl">{getStatusTitle()}</CardTitle>
          <CardDescription className="text-lg mt-2">
            {message}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          {status === "success" && (
            <>
              <Alert className="mb-6 border-green-200 bg-green-50">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Your subscription has been activated. You now have full access to all learning materials.
                </AlertDescription>
              </Alert>
              <p className="text-sm text-gray-600 mb-6">
                Redirecting to your dashboard in a few seconds...
              </p>
              <Button onClick={() => router.push("/dashboard")}>
                Go to Dashboard Now
              </Button>
            </>
          )}

          {status === "failed" && (
            <>
              <Alert variant="destructive" className="mb-6">
                <XCircle className="w-4 h-4" />
                <AlertDescription>
                  {message}
                </AlertDescription>
              </Alert>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Don't worry, you haven't been charged. Please try again or contact support if the issue persists.
                </p>
                <div className="flex gap-4 justify-center">
                  <Button variant="outline" onClick={() => router.push("/payment")}>
                    Try Again
                  </Button>
                  <Button onClick={() => router.push("/support")}>
                    Contact Support
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}