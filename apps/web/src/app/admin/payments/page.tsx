"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Download,
  Search,
  Filter,
  CreditCard,
  Smartphone,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";

interface Payment {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  currency: string;
  method: string;
  status: string;
  description: string;
  createdAt: string;
  completedAt?: string;
}

interface PaymentStats {
  totalRevenue: number;
  monthlyRevenue: number;
  successRate: number;
  averageTransaction: number;
  revenueGrowth: number;
  paymentMethodBreakdown: {
    payway: number;
    wing: number;
  };
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<PaymentStats>({
    totalRevenue: 0,
    monthlyRevenue: 0,
    successRate: 0,
    averageTransaction: 0,
    revenueGrowth: 0,
    paymentMethodBreakdown: {
      payway: 0,
      wing: 0,
    },
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [dateRange, setDateRange] = useState("30days");

  useEffect(() => {
    fetchPaymentData();
  }, [statusFilter, methodFilter, dateRange]);

  const fetchPaymentData = async () => {
    try {
      const params = new URLSearchParams({
        status: statusFilter,
        method: methodFilter,
        range: dateRange,
      });

      const [paymentsRes, statsRes] = await Promise.all([
        fetch(`/api/admin/payments?${params}`),
        fetch(`/api/admin/payments/stats?${params}`),
      ]);

      if (paymentsRes.ok) {
        const paymentsData = await paymentsRes.json();
        setPayments(paymentsData.payments || []);
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error("Error fetching payment data:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportPayments = async () => {
    try {
      const params = new URLSearchParams({
        status: statusFilter,
        method: methodFilter,
        range: dateRange,
      });

      const response = await fetch(`/api/admin/payments/export?${params}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `payments-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
      }
    } catch (error) {
      console.error("Error exporting payments:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return (
          <Badge className="bg-green-100 text-green-700">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        );
      case "PENDING":
        return (
          <Badge className="bg-yellow-100 text-yellow-700">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case "FAILED":
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Failed
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case "payway":
        return <CreditCard className="w-4 h-4" />;
      case "wing":
        return <Smartphone className="w-4 h-4" />;
      default:
        return <DollarSign className="w-4 h-4" />;
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         payment.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Payment Management</h1>
        <p className="text-gray-600">
          Monitor transactions and revenue
        </p>
      </div>

      {/* Revenue Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              All time revenue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            {stats.revenueGrowth > 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.monthlyRevenue.toFixed(2)}</div>
            <p className="text-xs mt-1">
              <span className={stats.revenueGrowth > 0 ? "text-green-600" : "text-red-600"}>
                {stats.revenueGrowth > 0 ? "+" : ""}{stats.revenueGrowth}%
              </span>
              {" "}from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.successRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Payment success rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Transaction</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.averageTransaction.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Per transaction
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Payment Method Breakdown */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Payment Method Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <CreditCard className="w-8 h-8 text-primary" />
                <div>
                  <p className="font-semibold">PayWay</p>
                  <p className="text-sm text-gray-600">Credit/Debit Cards</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{stats.paymentMethodBreakdown.payway}%</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Smartphone className="w-8 h-8 text-primary" />
                <div>
                  <p className="font-semibold">Wing Money</p>
                  <p className="text-sm text-gray-600">Mobile Payment</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{stats.paymentMethodBreakdown.wing}%</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Transactions</CardTitle>
            <Button onClick={exportPayments}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by user or transaction ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={methodFilter} onValueChange={setMethodFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All methods" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All methods</SelectItem>
                <SelectItem value="PAYWAY">PayWay</SelectItem>
                <SelectItem value="WING">Wing Money</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 days</SelectItem>
                <SelectItem value="30days">Last 30 days</SelectItem>
                <SelectItem value="90days">Last 90 days</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction ID</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-mono text-sm">
                    {payment.id.substring(0, 8)}...
                  </TableCell>
                  <TableCell>{payment.userName}</TableCell>
                  <TableCell>
                    ${payment.amount.toFixed(2)} {payment.currency}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getMethodIcon(payment.method)}
                      <span>{payment.method}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(payment.status)}</TableCell>
                  <TableCell>
                    {new Date(payment.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}