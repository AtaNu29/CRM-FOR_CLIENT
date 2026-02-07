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
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f18] p-4 relative overflow-hidden font-sans">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/30 rounded-full blur-[140px] animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-cyan-600/20 rounded-full blur-[160px]" />
      <div className="absolute top-[20%] right-[5%] w-[300px] h-[300px] bg-violet-600/20 rounded-full blur-[120px]" />

      <div className="w-full max-w-md z-10 relative">
        {/* Logo/Brand Header */}
        <div className="text-center mb-10 group cursor-default">
          <div className="inline-flex p-4 bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl mb-6 group-hover:scale-110 transition-transform duration-500 ease-out">
            <Shield className="w-12 h-12 text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]" />
          </div>
          <h1 className="text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-200 to-indigo-300 tracking-tighter mb-2">
            SAMRAT
          </h1>
          <div className="h-1 w-24 bg-gradient-to-r from-cyan-500 to-indigo-500 mx-auto rounded-full mb-4 shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
          <p className="text-cyan-100/60 font-medium tracking-[0.2em] uppercase text-xs">
            Next-Gen CRM Platform
          </p>
        </div>

        {/* Login Card */}
        <Card className="bg-white/[0.03] backdrop-blur-[40px] border border-white/10 rounded-[2.5rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden">
          <CardHeader className="pt-10 pb-4">
            <CardTitle className="text-3xl font-bold text-center text-white">Welcome Back</CardTitle>
            <CardDescription className="text-center text-cyan-100/40 font-medium">
              Elevate your business management
            </CardDescription>
          </CardHeader>

          <CardContent className="px-8 pb-10">
            <Tabs defaultValue="customer" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8 bg-white/5 p-1.5 rounded-2xl border border-white/5">
                <TabsTrigger
                  value="customer"
                  className="flex items-center gap-2 rounded-xl py-3 transition-all duration-300 font-bold text-cyan-100/40 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white data-[state=active]:shadow-lg"
                >
                  <User className="w-4 h-4" />
                  Customer
                </TabsTrigger>
                <TabsTrigger
                  value="admin"
                  className="flex items-center gap-2 rounded-xl py-3 transition-all duration-300 font-bold text-cyan-100/40 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg"
                >
                  <Shield className="w-4 h-4" />
                  Admin
                </TabsTrigger>
              </TabsList>

              {/* Customer Layout */}
              <TabsContent value="customer" className="animate-in fade-in zoom-in-95 duration-500">
                <form onSubmit={handleCustomerLogin} className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-cyan-100/60 uppercase tracking-widest ml-1">Identity</Label>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400/50 group-focus-within:text-cyan-400 transition-colors">
                        <User className="w-5 h-5" />
                      </div>
                      <Input
                        type="email"
                        placeholder="customer@domain.com"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        required
                        className="h-14 pl-11 bg-white/[0.02] border-white/10 text-white placeholder:text-white/20 focus:ring-cyan-500/50 focus:border-cyan-500/50 rounded-2xl transition-all"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-cyan-100/60 uppercase tracking-widest ml-1">Access Key</Label>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400/50 group-focus-within:text-cyan-400 transition-colors">
                        <Shield className="w-5 h-5" />
                      </div>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        value={customerPassword}
                        onChange={(e) => setCustomerPassword(e.target.value)}
                        required
                        className="h-14 pl-11 bg-white/[0.02] border-white/10 text-white placeholder:text-white/20 focus:ring-cyan-500/50 focus:border-cyan-500/50 rounded-2xl transition-all"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-14 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-black text-lg rounded-2xl shadow-[0_10px_30px_-10px_rgba(6,182,212,0.5)] transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3"
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <User className="w-6 h-6" />}
                    Enter Workspace
                  </Button>
                </form>
              </TabsContent>

              {/* Admin Layout */}
              <TabsContent value="admin" className="animate-in fade-in zoom-in-95 duration-500">
                <form onSubmit={handleAdminLogin} className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-cyan-100/60 uppercase tracking-widest ml-1">Admin Access</Label>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400/50 group-focus-within:text-indigo-400 transition-colors">
                        <Shield className="w-5 h-5" />
                      </div>
                      <Input
                        type="email"
                        placeholder="admin@access.com"
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        required
                        className="h-14 pl-11 bg-white/[0.02] border-white/10 text-white placeholder:text-white/20 focus:ring-indigo-500/50 focus:border-indigo-500/50 rounded-2xl transition-all"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-cyan-100/60 uppercase tracking-widest ml-1">Master Key</Label>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400/50 group-focus-within:text-indigo-400 transition-colors">
                        <Shield className="w-5 h-5" />
                      </div>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        required
                        className="h-14 pl-11 bg-white/[0.02] border-white/10 text-white placeholder:text-white/20 focus:ring-indigo-500/50 focus:border-indigo-500/50 rounded-2xl transition-all"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-14 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-lg rounded-2xl shadow-[0_10px_30px_-10px_rgba(99,102,241,0.5)] transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3"
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Shield className="w-6 h-6" />}
                    Authorize Admin
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-12 text-cyan-100/20 text-xs font-bold tracking-[0.3em] uppercase">
          <p>© 2024 Samrat-CRM • Secure Enterprise Access</p>
        </div>
      </div>
    </div>
  );
}
