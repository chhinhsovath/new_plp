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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Ban, 
  CheckCircle,
  Mail,
  Eye,
  UserCog,
  Download,
} from "lucide-react";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  parentId?: string;
  active: boolean;
  lastLoginAt?: string;
  createdAt: string;
  lessonsCompleted: number;
  subscriptionStatus?: string;
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, roleFilter, statusFilter, searchQuery]);

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        search: searchQuery,
        role: roleFilter,
        status: statusFilter,
      });

      const response = await fetch(`/api/admin/users?${params}`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
        setTotalUsers(data.total);
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserStatus = async (userId: string, active: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !active }),
      });

      if (response.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error("Error updating user status:", error);
    }
  };

  const handleChangeUserRole = async (userId: string, newRole: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      if (response.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error("Error updating user role:", error);
    }
  };

  const exportUsers = async () => {
    try {
      const response = await fetch("/api/admin/users/export");
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `users-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
      }
    } catch (error) {
      console.error("Error exporting users:", error);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "ADMIN": return "destructive";
      case "TEACHER": return "secondary";
      case "PARENT": return "outline";
      default: return "default";
    }
  };

  const getSubscriptionBadge = (status?: string) => {
    switch (status) {
      case "ACTIVE": 
        return <Badge className="bg-green-100 text-green-700">Active</Badge>;
      case "TRIAL":
        return <Badge className="bg-blue-100 text-blue-700">Trial</Badge>;
      case "EXPIRED":
        return <Badge className="bg-red-100 text-red-700">Expired</Badge>;
      default:
        return <Badge variant="outline">Free</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">User Management</h1>
            <p className="text-gray-600">
              Manage user accounts and permissions
            </p>
          </div>
          <Button onClick={exportUsers}>
            <Download className="w-4 h-4 mr-2" />
            Export Users
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Users ({totalUsers})</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All roles</SelectItem>
                <SelectItem value="STUDENT">Students</SelectItem>
                <SelectItem value="PARENT">Parents</SelectItem>
                <SelectItem value="TEACHER">Teachers</SelectItem>
                <SelectItem value="ADMIN">Admins</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Users Table */}
          {loading ? (
            <div className="text-center py-12">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Subscription</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {user.firstName[0]}{user.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeColor(user.role)}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {user.active ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <Ban className="w-4 h-4 text-red-600" />
                        )}
                        <span className={user.active ? "text-green-600" : "text-red-600"}>
                          {user.active ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getSubscriptionBadge(user.subscriptionStatus)}
                    </TableCell>
                    <TableCell>
                      {user.lastLoginAt
                        ? new Date(user.lastLoginAt).toLocaleDateString()
                        : "Never"}
                    </TableCell>
                    <TableCell>
                      {user.role === "STUDENT" && (
                        <span className="text-sm">
                          {user.lessonsCompleted} lessons
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail className="w-4 h-4 mr-2" />
                            Send Email
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleToggleUserStatus(user.id, user.active)}
                          >
                            {user.active ? (
                              <>
                                <Ban className="w-4 h-4 mr-2" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Activate
                              </>
                            )}
                          </DropdownMenuItem>
                          {user.role !== "ADMIN" && (
                            <DropdownMenuItem>
                              <UserCog className="w-4 h-4 mr-2" />
                              Change Role
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-600">
                Showing {(currentPage - 1) * 20 + 1} to{" "}
                {Math.min(currentPage * 20, totalUsers)} of {totalUsers} users
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}