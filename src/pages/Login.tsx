import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { User, Shield, Loader2 } from "lucide-react";
import { supabase } from "../lib/supabase";
import { toast } from "sonner";

export function Login() {
  const navigate = useNavigate();
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPassword, setCustomerPassword] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (email: string, password: string, type: 'admin' | 'customer') => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Check role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (profileError) throw profileError;

      const isAdminType = type === 'admin';
      const userRoleLower = (profile.role || '').toLowerCase();
      const isAuthorized = isAdminType
        ? userRoleLower.includes('admin')
        : userRoleLower === 'customer';

      if (!isAuthorized) {
        toast.error(`This account is not authorized as an ${isAdminType ? 'Administrator' : 'Customer'}`);
        await supabase.auth.signOut();
        return;
      }

      toast.success("Logged in successfully!");
      navigate(type === 'admin' ? "/admin" : "/customer");
    } catch (error: any) {
      toast.error(error.message || "An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    handleLogin(customerEmail, customerPassword, 'customer');
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    handleLogin(adminEmail, adminPassword, 'admin');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f4f8] p-4 relative overflow-hidden">
      {/* Decorative blurred circles for a premium feel */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#BDDDFC] rounded-full blur-[120px] opacity-40 animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-[#88BDF2] rounded-full blur-[120px] opacity-40" />

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-10 space-y-2">
          <div className="inline-block p-4 bg-white rounded-2xl shadow-xl mb-4">
            <Shield className="w-10 h-10 text-[#6A89A7]" />
          </div>
          <h1 className="text-5xl font-extrabold text-[#384959] tracking-tight">CRM</h1>
          <p className="text-[#64748b] font-medium text-lg">Next-Gen Service Management Platform</p>
        </div>

        <Card className="shadow-[0_20px_50px_rgba(0,0,0,0.1)] border-none bg-white/80 backdrop-blur-xl rounded-[2rem] overflow-hidden">
          <CardHeader className="pt-10 pb-6">
            <CardTitle className="text-3xl font-bold text-center text-[#384959]">Welcome Back</CardTitle>
            <CardDescription className="text-center text-gray-500 font-medium">
              Choose your account type to continue
            </CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-10">
            <Tabs defaultValue="customer" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8 bg-gray-100/50 p-1 rounded-xl">
                <TabsTrigger
                  value="customer"
                  className="flex items-center gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm py-3 transition-all font-semibold text-gray-600 data-[state=active]:text-[#6A89A7]"
                >
                  <User className="w-4 h-4" />
                  Customer
                </TabsTrigger>
                <TabsTrigger
                  value="admin"
                  className="flex items-center gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm py-3 transition-all font-semibold text-gray-600 data-[state=active]:text-[#384959]"
                >
                  <Shield className="w-4 h-4" />
                  Administrator
                </TabsTrigger>
              </TabsList>

              <TabsContent value="customer" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <form onSubmit={handleCustomerLogin} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="customer-email" className="text-sm font-bold text-[#384959] ml-1">Email Address</Label>
                    <Input
                      id="customer-email"
                      type="email"
                      placeholder="Enter your customer email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      required
                      className="h-12 border-gray-200 bg-white shadow-sm focus:ring-2 focus:ring-[#88BDF2] rounded-xl"
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customer-password" className="text-sm font-bold text-[#384959] ml-1">Password</Label>
                    <Input
                      id="customer-password"
                      type="password"
                      placeholder="••••••••"
                      value={customerPassword}
                      onChange={(e) => setCustomerPassword(e.target.value)}
                      required
                      className="h-12 border-gray-200 bg-white shadow-sm focus:ring-2 focus:ring-[#88BDF2] rounded-xl"
                      disabled={isLoading}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-12 mt-5 bg-gradient-to-r from-[#6A89A7] to-[#88BDF2] hover:from-[#5d7a96] hover:to-[#7aa9da] text-white font-bold rounded-xl shadow-lg shadow-[#88BDF2]/20 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <User className="w-5 h-5" />}
                    Sign In as Customer
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="admin" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <form onSubmit={handleAdminLogin} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="admin-email" className="text-sm font-bold text-[#384959] ml-1">Admin Email</Label>
                    <Input
                      id="admin-email"
                      type="email"
                      placeholder="Enter admin credentials"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      required
                      className="h-12 border-gray-200 bg-white shadow-sm focus:ring-2 focus:ring-[#384959] rounded-xl"
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-password" className="text-sm font-bold text-[#384959] ml-1">Password</Label>
                    <Input
                      id="admin-password"
                      type="password"
                      placeholder="••••••••"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      required
                      className="h-12 border-gray-200 bg-white shadow-sm focus:ring-2 focus:ring-[#384959] rounded-xl"
                      disabled={isLoading}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-12 mt-5 bg-[#384959] hover:bg-[#2c3a47] text-white font-bold rounded-xl shadow-lg shadow-[#384959]/20 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Shield className="w-5 h-5" />}
                    Sign In as Administrator
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="text-center mt-10 text-gray-400 text-sm font-medium">
          <p>© 2024 Samrat-CRM. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
