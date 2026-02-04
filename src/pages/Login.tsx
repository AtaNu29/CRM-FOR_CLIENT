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

      if (profile.role !== type) {
        toast.error(`This account is not registered as an ${type}`);
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#6A89A7] via-[#88BDF2] to-[#BDDDFC] p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">SaaS Platform</h1>
          <p className="text-white/90">Website, SEO & Social Media Services</p>
        </div>

        <Card className="shadow-2xl border-none">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Welcome Back</CardTitle>
            <CardDescription className="text-center">
              Sign in to access your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="customer" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="customer" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Customer
                </TabsTrigger>
                <TabsTrigger value="admin" className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Admin
                </TabsTrigger>
              </TabsList>

              <TabsContent value="customer">
                <form onSubmit={handleCustomerLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="customer-email">Email</Label>
                    <Input
                      id="customer-email"
                      type="email"
                      placeholder="customer@example.com"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      required
                      className="bg-white"
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customer-password">Password</Label>
                    <Input
                      id="customer-password"
                      type="password"
                      placeholder="••••••••"
                      value={customerPassword}
                      onChange={(e) => setCustomerPassword(e.target.value)}
                      required
                      className="bg-white"
                      disabled={isLoading}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-[#6A89A7] hover:bg-[#88BDF2] text-white transition-colors"
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Sign In as Customer
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="admin">
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-email">Email</Label>
                    <Input
                      id="admin-email"
                      type="email"
                      placeholder="admin@example.com"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      required
                      className="bg-white"
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-password">Password</Label>
                    <Input
                      id="admin-password"
                      type="password"
                      placeholder="••••••••"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      required
                      className="bg-white"
                      disabled={isLoading}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-[#384959] hover:bg-[#6A89A7] text-white transition-colors"
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Sign In as Admin
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center">
              <a href="#" className="text-sm text-[#6A89A7] hover:underline">
                Forgot your password?
              </a>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-white/80 text-sm">
          <p>Login with your registered credentials</p>
        </div>
      </div>
    </div>
  );
}
