"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Check, 
  CreditCard, 
  Smartphone,
  DollarSign,
  Calendar,
  Users,
  BookOpen,
  Trophy,
  Zap,
  Shield,
  HelpCircle
} from "lucide-react";

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  duration: string;
  features: string[];
  popular?: boolean;
  savings?: string;
}

const pricingPlans: PricingPlan[] = [
  {
    id: "monthly",
    name: "Monthly Plan",
    price: 4.99,
    currency: "USD",
    duration: "month",
    features: [
      "Access to all subjects",
      "Unlimited exercises",
      "Progress tracking",
      "Forum access",
      "Parent dashboard",
    ],
  },
  {
    id: "yearly",
    name: "Yearly Plan",
    price: 49.99,
    currency: "USD",
    duration: "year",
    features: [
      "Access to all subjects",
      "Unlimited exercises",
      "Progress tracking",
      "Forum access",
      "Parent dashboard",
      "Priority support",
      "Downloadable resources",
    ],
    popular: true,
    savings: "Save $10",
  },
  {
    id: "lifetime",
    name: "Lifetime Access",
    price: 149.99,
    currency: "USD",
    duration: "lifetime",
    features: [
      "Access to all subjects",
      "Unlimited exercises",
      "Progress tracking",
      "Forum access",
      "Parent dashboard",
      "Priority support",
      "Downloadable resources",
      "Future content updates",
      "Certificate of completion",
    ],
    savings: "Best Value",
  },
];

export default function PaymentPage() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState("yearly");
  const [paymentMethod, setPaymentMethod] = useState("payway");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userSubscription, setUserSubscription] = useState<any>(null);

  useEffect(() => {
    fetchUserSubscription();
  }, []);

  const fetchUserSubscription = async () => {
    try {
      const response = await fetch("/api/user/subscription");
      if (response.ok) {
        const data = await response.json();
        setUserSubscription(data.subscription);
      }
    } catch (error) {
      console.error("Error fetching subscription:", error);
    }
  };

  const handlePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      const plan = pricingPlans.find(p => p.id === selectedPlan);
      if (!plan) return;

      const response = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: selectedPlan,
          amount: plan.price,
          currency: plan.currency,
          paymentMethod,
        }),
      });

      if (!response.ok) {
        throw new Error("Payment initialization failed");
      }

      const data = await response.json();

      // Redirect to payment provider
      if (paymentMethod === "payway") {
        // PayWay integration
        window.location.href = data.paymentUrl;
      } else if (paymentMethod === "wing") {
        // Wing Money integration
        window.location.href = data.paymentUrl;
      }
    } catch (err) {
      setError("Failed to process payment. Please try again.");
      console.error("Payment error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (userSubscription?.status === "ACTIVE") {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-green-600" />
              Active Subscription
            </CardTitle>
            <CardDescription>
              You have an active subscription to the Primary Learning Platform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Plan</p>
                <p className="font-semibold">{userSubscription.plan}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <Badge className="bg-green-100 text-green-700">Active</Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600">Started</p>
                <p className="font-semibold">
                  {new Date(userSubscription.startDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Renews</p>
                <p className="font-semibold">
                  {new Date(userSubscription.endDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <Button onClick={() => router.push("/dashboard")}>
                Go to Dashboard
              </Button>
              <Button variant="outline" onClick={() => router.push("/payment/manage")}>
                Manage Subscription
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">
          Choose Your Learning Journey
        </h1>
        <p className="text-xl text-gray-600">
          Unlock unlimited access to all subjects and features
        </p>
      </div>

      {/* Pricing Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {pricingPlans.map((plan) => (
          <Card 
            key={plan.id}
            className={`cursor-pointer transition-all ${
              selectedPlan === plan.id ? "ring-2 ring-primary" : ""
            } ${plan.popular ? "relative overflow-hidden" : ""}`}
            onClick={() => setSelectedPlan(plan.id)}
          >
            {plan.popular && (
              <div className="absolute top-0 right-0 bg-primary text-white px-3 py-1 text-sm">
                Most Popular
              </div>
            )}
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-3xl font-bold">${plan.price}</span>
                  <span className="text-gray-600">/{plan.duration}</span>
                </div>
                {plan.savings && (
                  <Badge variant="secondary" className="mt-2">
                    {plan.savings}
                  </Badge>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Payment Methods */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Select Payment Method</CardTitle>
          <CardDescription>
            Choose your preferred payment method
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Label
                htmlFor="payway"
                className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all ${
                  paymentMethod === "payway" ? "border-primary bg-primary/5" : ""
                }`}
              >
                <RadioGroupItem value="payway" id="payway" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    <span className="font-semibold">PayWay</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Credit/Debit cards, Bank transfers
                  </p>
                </div>
              </Label>

              <Label
                htmlFor="wing"
                className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all ${
                  paymentMethod === "wing" ? "border-primary bg-primary/5" : ""
                }`}
              >
                <RadioGroupItem value="wing" id="wing" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-5 h-5" />
                    <span className="font-semibold">Wing Money</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Mobile payment, Wing account
                  </p>
                </div>
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Features */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>What's Included</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex gap-3">
              <BookOpen className="w-8 h-8 text-primary mt-1" />
              <div>
                <h3 className="font-semibold mb-1">All Subjects</h3>
                <p className="text-sm text-gray-600">
                  Complete access to Khmer, Math, English, and Science
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Zap className="w-8 h-8 text-primary mt-1" />
              <div>
                <h3 className="font-semibold mb-1">40+ Exercise Types</h3>
                <p className="text-sm text-gray-600">
                  Interactive exercises to reinforce learning
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Trophy className="w-8 h-8 text-primary mt-1" />
              <div>
                <h3 className="font-semibold mb-1">Track Progress</h3>
                <p className="text-sm text-gray-600">
                  Monitor your child's learning journey
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Users className="w-8 h-8 text-primary mt-1" />
              <div>
                <h3 className="font-semibold mb-1">Parent Dashboard</h3>
                <p className="text-sm text-gray-600">
                  Manage multiple child accounts
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Calendar className="w-8 h-8 text-primary mt-1" />
              <div>
                <h3 className="font-semibold mb-1">Regular Updates</h3>
                <p className="text-sm text-gray-600">
                  New content added monthly
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <HelpCircle className="w-8 h-8 text-primary mt-1" />
              <div>
                <h3 className="font-semibold mb-1">Support</h3>
                <p className="text-sm text-gray-600">
                  Get help when you need it
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col items-center gap-4">
        <Button 
          size="lg" 
          onClick={handlePayment}
          disabled={loading}
          className="min-w-[200px]"
        >
          {loading ? "Processing..." : "Continue to Payment"}
        </Button>
        <p className="text-sm text-gray-600">
          <Shield className="inline w-4 h-4 mr-1" />
          Secure payment processed by {paymentMethod === "payway" ? "PayWay" : "Wing Money"}
        </p>
      </div>
    </div>
  );
}