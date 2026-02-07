import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Input } from "../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  LogOut,
  Users,
  FileText,
  Crown,
  Search,
  Eye,
  Download,
  Plus,
  Shield,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { CustomerDetails } from "../components/CustomerDetails";
import { AddUserDialog } from "../components/AddUserDialog";
import { UpdateServiceProgress } from "../components/UpdateServiceProgress";
import { AnalyticsCharts } from "../components/AnalyticsCharts";
import { supabase } from "../lib/supabase";
import { toast } from "sonner";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import { Bell } from "lucide-react";

export function AdminDashboard() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<any[]>([]);
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [customerProgressData, setCustomerProgressData] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setNotifications(data);
  };

  const markNotificationRead = async (id: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);

    if (!error) fetchNotifications();
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch all profiles
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch file counts
      const { data: filesData } = await supabase.from('files').select('customer_id');
      const fileCounts = (filesData || []).reduce((acc: any, curr: any) => {
        acc[curr.customer_id] = (acc[curr.customer_id] || 0) + 1;
        return acc;
      }, {});

      // Fetch all service updates to calculate progress for analytics
      const { data: allUpdates } = await supabase
        .from('service_updates')
        .select('*');

      const customersList = data.filter((p: any) => p.role === 'customer').map(p => {
        // Calculate average progress for this customer
        const userUpdates = (allUpdates || []).filter(u => u.customer_id === p.id);
        const services = ['Website', 'SEO', 'Social Media'];
        let totalProgress = 0;

        services.forEach(s => {
          const latest = userUpdates
            .filter(u => u.service.toLowerCase() === s.toLowerCase())
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
          totalProgress += latest ? latest.progress : 0;
        });

        const avgProgress = Math.round(totalProgress / services.length);

        return {
          id: p.id,
          name: p.full_name || 'No Name',
          email: p.email,
          membership: p.membership || 'Basic',
          status: p.status || 'Active',
          joinDate: p.join_date || p.created_at?.split('T')[0],
          filesCount: fileCounts[p.id] || 0,
          avgProgress
        };
      });

      const adminsList = data.filter((p: any) => p.role === 'admin').map(p => ({
        id: p.id,
        name: p.full_name || 'Admin',
        email: p.email,
        role: p.role,
        createdDate: p.created_at?.split('T')[0],
      }));

      setCustomers(customersList);
      setAdmins(adminsList);

      // Data for the completion chart
      setCustomerProgressData(customersList.map(c => ({
        name: c.name,
        progress: c.avgProgress
      })));

    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case "Basic":
        return "bg-[#BDDDFC] text-[#384959]";
      case "Pro":
        return "bg-[#88BDF2] text-white";
      case "Premium":
        return "bg-[#6A89A7] text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getStatusColor = (status: string) => {
    return status === "Active"
      ? "bg-green-100 text-green-700"
      : "bg-red-100 text-red-700";
  };

  const membershipStats = {
    Basic: customers.filter((c) => c.membership === "Basic").length,
    Pro: customers.filter((c) => c.membership === "Pro").length,
    Premium: customers.filter((c) => c.membership === "Premium").length,
  };

  const handleAddUser = async (data: { name: string; email: string; role: string; password?: string }) => {
    try {
      const { error } = await supabase.rpc('create_new_user', {
        user_email: data.email,
        user_password: data.password,
        user_full_name: data.name,
        user_role: data.role
      });

      if (error) throw error;

      toast.success(`${data.role === 'admin' ? 'Admin' : 'Customer'} created successfully!`);
      // Hide dialogs
      setShowAddAdmin(false);
      setShowAddCustomer(false);
      // Refresh list
      await fetchData();
    } catch (error: any) {
      toast.error("Failed to create user: " + error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-[#6A89A7]" />
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f9fc] to-[#BDDDFC]/20">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#6A89A7] to-[#88BDF2] text-white sticky top-0 z-10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">Admin Dashboard</h1>
                <p className="text-sm text-white/80">Manage customers and services</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative text-white hover:bg-white/10">
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center border-2 border-[#6A89A7]">
                        {unreadCount}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="end">
                  <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-semibold text-[#384959]">Notifications</h3>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => markNotificationRead(n.id)}
                          className={`p-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 cursor-pointer transition-colors ${!n.is_read ? 'bg-blue-50/50' : ''}`}
                        >
                          <div className="flex justify-between items-start">
                            <p className={`text-sm font-medium ${!n.is_read ? 'text-[#6A89A7]' : 'text-[#384959]'}`}>{n.title}</p>
                            {!n.is_read && <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5" />}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{n.message}</p>
                          <p className="text-[10px] text-gray-400 mt-2">
                            {new Date(n.created_at).toLocaleString()}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-sm text-gray-400">
                        No notifications yet
                      </div>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
              <Button
                variant="secondary"
                onClick={handleLogout}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="border-none shadow-xl bg-white/50 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-[#64748b] uppercase tracking-wider">
                  Total Customers
                </CardTitle>
                <div className="p-2 bg-[#6A89A7]/10 rounded-lg">
                  <Users className="w-5 h-5 text-[#6A89A7]" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black text-[#384959]">{customers.length}</div>
              <p className="text-sm font-semibold text-green-600 mt-2 flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                {customers.filter((c) => c.status === "Active").length} Active Now
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl bg-white/50 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-[#64748b] uppercase tracking-wider">
                  Basic Plan
                </CardTitle>
                <div className="p-2 bg-[#BDDDFC]/20 rounded-lg">
                  <Crown className="w-5 h-5 text-[#384959]" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black text-[#384959]">
                {membershipStats.Basic}
              </div>
              <p className="text-sm font-medium text-gray-500 mt-2 italic">Standard Tier</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl bg-white/50 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-[#64748b] uppercase tracking-wider">
                  Pro Users
                </CardTitle>
                <div className="p-2 bg-[#88BDF2]/20 rounded-lg">
                  <Crown className="w-5 h-5 text-[#88BDF2]" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black text-[#384959]">
                {membershipStats.Pro}
              </div>
              <p className="text-sm font-medium text-gray-500 mt-2 italic">Professional Tier</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl bg-white/50 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-[#64748b] uppercase tracking-wider">
                  Premium
                </CardTitle>
                <div className="p-2 bg-[#6A89A7]/20 rounded-lg">
                  <Crown className="w-5 h-5 text-[#6A89A7]" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black text-[#384959]">
                {membershipStats.Premium}
              </div>
              <p className="text-sm font-medium text-gray-500 mt-2 italic">Enterprise Tier</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="customers" className="space-y-6">
          <TabsList className="bg-white border border-gray-200">
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="admins">Admin Users</TabsTrigger>
          </TabsList>

          {/* Customers Tab */}
          <TabsContent value="customers" className="space-y-6">
            <Card className="border-none shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Customer Management</CardTitle>
                    <CardDescription>
                      View and manage all customer accounts
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-4">
                    <Dialog open={showAddCustomer} onOpenChange={setShowAddCustomer}>
                      <DialogTrigger asChild>
                        <Button className="bg-[#6A89A7] hover:bg-[#88BDF2] text-white">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Customer
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add New Customer</DialogTitle>
                          <DialogDescription>
                            Create a new customer profile.
                          </DialogDescription>
                        </DialogHeader>
                        <AddUserDialog
                          type="customer"
                          onAdd={handleAddUser}
                          onClose={() => setShowAddCustomer(false)}
                        />
                      </DialogContent>
                    </Dialog>
                    <div className="relative w-72">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Search customers..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border border-gray-200 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Membership</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Files</TableHead>
                        <TableHead>Join Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCustomers.length > 0 ? (
                        filteredCustomers.map((customer) => (
                          <TableRow key={customer.id}>
                            <TableCell className="font-medium">{customer.name}</TableCell>
                            <TableCell>{customer.email}</TableCell>
                            <TableCell>
                              <Badge className={getPlanColor(customer.membership)}>
                                {customer.membership}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(customer.status)}>
                                {customer.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{customer.filesCount}</TableCell>
                            <TableCell>{customer.joinDate}</TableCell>
                            <TableCell>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedCustomer(customer)}
                                    className="text-[#6A89A7] hover:text-[#88BDF2]"
                                  >
                                    <Eye className="w-4 h-4 mr-1" />
                                    View
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle>Customer Details</DialogTitle>
                                    <DialogDescription>
                                      View and manage customer information
                                    </DialogDescription>
                                  </DialogHeader>
                                  {selectedCustomer && (
                                    <CustomerDetails
                                      customer={selectedCustomer}
                                      onUpdate={fetchData}
                                    />
                                  )}
                                </DialogContent>
                              </Dialog>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                            No customers found. Create one in Supabase Auth to get started.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsCharts customers={customers} progressData={customerProgressData} />
          </TabsContent>

          {/* Admin Users Tab */}
          <TabsContent value="admins" className="space-y-6">
            <Card className="border-none shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Admin Users</CardTitle>
                    <CardDescription>Manage administrative accounts</CardDescription>
                  </div>
                  <Dialog open={showAddAdmin} onOpenChange={setShowAddAdmin}>
                    <DialogTrigger asChild>
                      <Button className="bg-[#6A89A7] hover:bg-[#88BDF2] text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Admin
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Admin</DialogTitle>
                        <DialogDescription>
                          Create a new administrative user account
                        </DialogDescription>
                      </DialogHeader>
                      <AddUserDialog
                        type="admin"
                        onAdd={handleAddUser}
                        onClose={() => setShowAddAdmin(false)}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border border-gray-200 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Created Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {admins.map((admin) => (
                        <TableRow key={admin.id}>
                          <TableCell className="font-medium">{admin.name}</TableCell>
                          <TableCell>{admin.email}</TableCell>
                          <TableCell>
                            <Badge className="bg-[#384959] text-white">
                              {admin.role}
                            </Badge>
                          </TableCell>
                          <TableCell>{admin.createdDate}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}