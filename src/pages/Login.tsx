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
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-4 relative overflow-hidden">
      {/* Premium Background Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-gradient-to-br from-[#BDDDFC]/30 to-transparent rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-gradient-to-tr from-[#88BDF2]/20 to-transparent rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none" />

      <div className="w-full max-w-md z-10 animate-in fade-in zoom-in-95 duration-700">
        {/* Branding Area */}
        <div className="text-center mb-8 space-y-3 flex flex-col items-center">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#6A89A7] to-[#88BDF2] rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
            <div className="relative flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-xl transition-transform duration-500 group-hover:scale-110">
              <Shield className="w-10 h-10 text-[#6A89A7]" />
            </div>
          </div>
          <div className="space-y-1">
            <h1 className="text-6xl font-black text-[#384959] tracking-tighter drop-shadow-sm">CRM</h1>
            <p className="text-[#64748b] font-semibold text-sm tracking-widest uppercase opacity-80">Next-Gen Management</p>
          </div>
        </div>

        {/* Main Authentication Card */}
        <Card className="shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] border border-white/40 bg-white/70 backdrop-blur-2xl rounded-[2.5rem] overflow-hidden">
          <CardHeader className="pt-10 pb-4 text-center">
            <CardTitle className="text-3xl font-extrabold text-[#384959] tracking-tight">Welcome Back</CardTitle>
            <CardDescription className="text-slate-500 font-medium text-base">
              Securely access your service dashboard
            </CardDescription>
          </CardHeader>

          <CardContent className="px-8 pb-10">
            <Tabs defaultValue="customer" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-10 bg-slate-200/40 p-1.5 rounded-2xl h-14">
                <TabsTrigger
                  value="customer"
                  className="flex items-center justify-center gap-2 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-lg py-2 transition-all duration-300 font-bold text-slate-500 data-[state=active]:text-[#6A89A7]"
                >
                  <User className="w-4 h-4" />
                  Customer
                </TabsTrigger>
                <TabsTrigger
                  value="admin"
                  className="flex items-center justify-center gap-2 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-lg py-2 transition-all duration-300 font-bold text-slate-500 data-[state=active]:text-[#384959]"
                >
                  <Shield className="w-4 h-4" />
                  Staff
                </TabsTrigger>
              </TabsList>

              <div className="relative min-h-[300px]">
                {/* Customer Login Section */}
                <TabsContent value="customer" className="animate-in fade-in slide-in-from-left-8 duration-500 outline-none m-0">
                  <div className="bg-gradient-to-b from-[#f8fafc] to-white p-7 rounded-3xl border border-slate-100 shadow-sm">
                    <form onSubmit={handleCustomerLogin} className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="customer-email" className="text-xs font-black uppercase tracking-wider text-[#384959]/60 ml-1">Client Email</Label>
                        <Input
                          id="customer-email"
                          type="email"
                          placeholder="Your official email"
                          value={customerEmail}
                          onChange={(e) => setCustomerEmail(e.target.value)}
                          required
                          className="h-14 border-slate-200/70 bg-white/50 shadow-inner focus:ring-4 focus:ring-[#BDDDFC]/20 rounded-2xl px-5 transition-all text-slate-700"
                          disabled={isLoading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="customer-password" className="text-xs font-black uppercase tracking-wider text-[#384959]/60 ml-1">Security Key</Label>
                        <Input
                          id="customer-password"
                          type="password"
                          placeholder="••••••••"
                          value={customerPassword}
                          onChange={(e) => setCustomerPassword(e.target.value)}
                          required
                          className="h-14 border-slate-200/70 bg-white/50 shadow-inner focus:ring-4 focus:ring-[#BDDDFC]/20 rounded-2xl px-5 transition-all text-slate-700"
                          disabled={isLoading}
                        />
                      </div>
                      <Button
                        type="submit"
                        className="w-full h-14 mt-6 bg-gradient-to-r from-[#6A89A7] to-[#88BDF2] hover:from-[#5d7a96] hover:to-[#7aa9da] text-white font-black text-lg rounded-2xl shadow-xl shadow-[#88BDF2]/30 transition-all hover:scale-[1.03] active:scale-95 flex items-center justify-center gap-3"
                        disabled={isLoading}
                      >
                        {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <User className="w-6 h-6" />}
                        Access Dashboard
                      </Button>
                    </form>
                  </div>
                </TabsContent>

                {/* Admin Login Section */}
                <TabsContent value="admin" className="animate-in fade-in slide-in-from-right-8 duration-500 outline-none m-0">
                  <div className="bg-gradient-to-b from-[#f1f5f9] to-white p-7 rounded-3xl border border-slate-200 shadow-sm">
                    <form onSubmit={handleAdminLogin} className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="admin-email" className="text-xs font-black uppercase tracking-wider text-slate-500 ml-1">Administrator ID</Label>
                        <Input
                          id="admin-email"
                          type="email"
                          placeholder="Admin credentials"
                          value={adminEmail}
                          onChange={(e) => setAdminEmail(e.target.value)}
                          required
                          className="h-14 border-slate-200/70 bg-white/50 shadow-inner focus:ring-4 focus:ring-slate-200/50 rounded-2xl px-5 transition-all text-slate-700"
                          disabled={isLoading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="admin-password" className="text-xs font-black uppercase tracking-wider text-slate-500 ml-1">Access Token</Label>
                        <Input
                          id="admin-password"
                          type="password"
                          placeholder="••••••••"
                          value={adminPassword}
                          onChange={(e) => setAdminPassword(e.target.value)}
                          required
                          className="h-14 border-slate-200/70 bg-white/50 shadow-inner focus:ring-4 focus:ring-slate-200/50 rounded-2xl px-5 transition-all text-slate-700"
                          disabled={isLoading}
                        />
                      </div>
                      <Button
                        type="submit"
                        className="w-full h-14 mt-6 bg-[#384959] hover:bg-[#2c3a47] text-white font-black text-lg rounded-2xl shadow-xl shadow-slate-400/20 transition-all hover:scale-[1.03] active:scale-95 flex items-center justify-center gap-3"
                        disabled={isLoading}
                      >
                        {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Shield className="w-6 h-6" />}
                        Staff Gateway
                      </Button>
                    </form>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
          <p className="text-slate-400 text-xs font-bold tracking-widest uppercase">
            © 2026 Innovation CRM • Confidential Access
          </p>
        </div>
      </div>
    </div>
  );
}
