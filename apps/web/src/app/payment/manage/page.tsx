"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  CreditCard, 
  Calendar,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";

interface Subscription {
  id: string;
  plan: string;
  status: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  currency: string;
  status: string;
  description: string;
  createdAt: string;
}

export default function ManageSubscriptionPage() {
  const router = useRouter();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const fetchSubscriptionData = async () => {
    try {
      const [subRes, transRes] = await Promise.all([
        fetch("/api/user/subscription"),
        fetch("/api/user/transactions"),
      ]);

      if (subRes.ok) {
        const subData = await subRes.json();
        setSubscription(subData.subscription);
      }

      if (transRes.ok) {
        const transData = await transRes.json();
        setTransactions(transData.transactions || []);
      }
    } catch (error) {
      console.error("Error fetching subscription data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm("Are you sure you want to cancel your subscription?")) return;

    setCancelling(true);
    try {
      const response = await fetch("/api/user/subscription/cancel", {
        method: "POST",
      });

      if (response.ok) {
        fetchSubscriptionData();
      }
    } catch (error) {
      console.error("Error cancelling subscription:", error);
    } finally {
      setCancelling(false);
    }
  };

  const downloadInvoice = async (transactionId: string) => {
    try {
      const response = await fetch(`/api/user/transactions/${transactionId}/invoice`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `invoice-${transactionId}.pdf`;
        a.click();
      }
    } catch (error) {
      console.error("Error downloading invoice:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge className="bg-green-100 text-green-700">Active</Badge>;
      case "CANCELLED":
        return <Badge variant="secondary">Cancelled</Badge>;
      case "EXPIRED":
        return <Badge variant="destructive">Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTransactionStatusIcon = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "FAILED":
        return <XCircle className="w-4 h-4 text-red-600" />;
      case "PENDING":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="text-center py-12">Loading...</div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle>No Active Subscription</CardTitle>
            <CardDescription>
              You don't have an active subscription
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/payment")}>
              Subscribe Now
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const daysRemaining = Math.ceil(
    (new Date(subscription.endDate).getTime() - new Date().getTime()) / 
    (1000 * 60 * 60 * 24)
  );

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Manage Subscription</h1>
        <p className="text-gray-600">
          View and manage your subscription details
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="billing">Billing History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Subscription Status */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Current Subscription</CardTitle>
                {getStatusBadge(subscription.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Plan</p>
                  <p className="text-lg font-semibold">{subscription.plan}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Status</p>
                  <div className="flex items-center gap-2">
                    {subscription.isActive ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-lg font-semibold text-green-600">Active</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5 text-red-600" />
                        <span className="text-lg font-semibold text-red-600">Inactive</span>
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Started</p>
                  <p className="text-lg font-semibold">
                    {new Date(subscription.startDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    {subscription.isActive ? "Renews" : "Expired"}
                  </p>
                  <p className="text-lg font-semibold">
                    {new Date(subscription.endDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {subscription.isActive && daysRemaining < 30 && (
                <Alert>
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription>
                    Your subscription will expire in {daysRemaining} days.
                    {" "}
                    <Button variant="link" className="p-0 h-auto" onClick={() => router.push("/payment")}>
                      Renew now
                    </Button>
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-4">
                {subscription.isActive ? (
                  <>
                    <Button variant="outline" onClick={() => router.push("/payment")}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Upgrade Plan
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={handleCancelSubscription}
                      disabled={cancelling}
                    >
                      {cancelling ? "Cancelling..." : "Cancel Subscription"}
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => router.push("/payment")}>
                    Reactivate Subscription
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <Card>
            <CardHeader>
              <CardTitle>Your Plan Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>Access to all subjects</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>Unlimited exercises</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>Progress tracking</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>Forum access</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>Parent dashboard</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>Priority support</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
              <CardDescription>
                View your past transactions and download invoices
              </CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No transactions found
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Invoice</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell>
                          ${transaction.amount.toFixed(2)} {transaction.currency}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getTransactionStatusIcon(transaction.status)}
                            <span className={
                              transaction.status === "SUCCESS" ? "text-green-600" :
                              transaction.status === "FAILED" ? "text-red-600" :
                              "text-gray-600"
                            }>
                              {transaction.status}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {transaction.status === "SUCCESS" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => downloadInvoice(transaction.id)}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}