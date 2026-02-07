import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { User, Shield, Loader2, Eye, EyeOff, Moon, Sun, Github, Mail } from "lucide-react";
import { supabase } from "../lib/supabase";
import { toast } from "sonner";
import { Checkbox } from "../components/ui/checkbox";

export function Login() {
  const navigate = useNavigate();
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPassword, setCustomerPassword] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("customer");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

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
    <div
      className="min-h-screen  flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-500"
      style={{
        background: isDarkMode
          ? 'linear-gradient(to bottom right, #0f172a, #581c87, #0f172a)'
          : 'linear-gradient(to bottom right, #22d3ee, #3b82f6, #9333ea)'
      }}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-0 -left-4 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"
          style={{ backgroundColor: isDarkMode ? '#9333ea' : '#f472b6' }}
        ></div>
        <div
          className="absolute top-0 -right-4 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"
          style={{ backgroundColor: isDarkMode ? '#06b6d4' : '#fbbf24' }}
        ></div>
        <div
          className="absolute -bottom-8 left-20 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"
          style={{ backgroundColor: isDarkMode ? '#ec4899' : '#22d3ee' }}
        ></div>
      </div>

      <div className="w-full max-w-md z-10">
        {/* Glassmorphism Card */}
        <Card
          className="backdrop-blur-2xl shadow-2xl border-2 rounded-[2.5rem] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700 relative"
          style={{
            backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.6)' : 'rgba(255, 255, 255, 0.7)',
            borderColor: isDarkMode ? 'rgba(168, 85, 247, 0.3)' : 'rgba(255, 255, 255, 0.6)'
          }}
        >
          {/* Dark Mode Toggle - Top Left Corner */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="absolute top-4 left-4 p-2 rounded-none shadow-md hover:scale-110 transition-all duration-300 z-50 hover:shadow-lg"
            style={{
              backgroundColor: isDarkMode ? '#9333ea' : '#ffffff',
              color: isDarkMode ? '#fde047' : '#9333ea'
            }}
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <CardHeader className="text-center px-14 pt-16 pb-8 space-y-3">
            <div
              className="mx-auto w-16 h-16 rounded-none flex items-center justify-center mb-4 animate-in zoom-in duration-500 shadow-lg"
              style={{ background: 'linear-gradient(to bottom right, #06b6d4, #3b82f6, #9333ea)' }}
            >
              <Shield className="w-8 h-8 text-white" />
            </div>
            <CardTitle className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'} tracking-tight`}>
              Welcome Back
            </CardTitle>
            <CardDescription className={`text-base ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
              Sign in to access your dashboard
            </CardDescription>
          </CardHeader>

          <CardContent className="px-14 pb-14 pt-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              {/* Modern Tab Switcher */}
              <TabsList
                className="grid w-full grid-cols-2 mb-10 p-2 rounded-2xl h-14"
                style={{ backgroundColor: isDarkMode ? 'rgba(51, 65, 85, 0.5)' : 'rgba(226, 232, 240, 0.7)' }}
              >
                <TabsTrigger
                  value="customer"
                  className="rounded-lg font-semibold transition-all duration-300 data-[state=active]:shadow-lg"
                  style={{
                    color: activeTab === 'customer' ? '#ffffff' : (isDarkMode ? '#cbd5e1' : '#334155'),
                    background: activeTab === 'customer'
                      ? 'linear-gradient(to right, #06b6d4, #3b82f6)'
                      : 'transparent'
                  }}
                >
                  <User className="w-4 h-4 mr-2" />
                  Customer
                </TabsTrigger>
                <TabsTrigger
                  value="admin"
                  className="rounded-2xl font-semibold transition-all duration-300 data-[state=active]:shadow-lg"
                  style={{
                    color: activeTab === 'admin' ? '#ffffff' : (isDarkMode ? '#cbd5e1' : '#334155'),
                    background: activeTab === 'admin'
                      ? 'linear-gradient(to right, #9333ea, #ec4899)'
                      : 'transparent'
                  }}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Admin
                </TabsTrigger>
              </TabsList>

              {/* Customer Login Form */}
              <TabsContent value="customer" className="mt-0 space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
                <form onSubmit={handleCustomerLogin} className="space-y-5">
                  {/* Email Input with Floating Label */}
                  <div className="relative group mb-8" style={{ minHeight: '48px' }}>
                    <Input
                      type="email"
                      id="customer-email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      required
                      placeholder=" "
                      className="peer h-12 pt-4 px-4 rounded-2xl transition-all duration-300 focus:ring-2 placeholder-transparent relative z-0 w-full"
                      style={{
                        backgroundColor: isDarkMode ? 'rgba(51, 65, 85, 0.5)' : 'rgba(255, 255, 255, 0.8)',
                        borderColor: isDarkMode ? '#475569' : '#cbd5e1',
                        borderWidth: '1px',
                        color: isDarkMode ? '#ffffff' : '#1e293b',
                        minHeight: '48px',
                        height: '48px',
                        display: 'block'
                      }}
                      disabled={isLoading}
                    />
                    <Label
                      htmlFor="customer-email"
                      className={`absolute left-4 z-10 pointer-events-none transition-all duration-300 
                        ${isDarkMode ? 'text-slate-400 peer-focus:text-cyan-400' : 'text-slate-500 peer-focus:text-cyan-600'}
                        peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-base
                        top-2 -translate-y-0 text-xs font-semibold`}
                    >
                      Enter id
                    </Label>
                  </div>

                  {/* Password Input with Show/Hide Toggle */}
                  <div className="relative group mb-8" style={{ minHeight: '48px' }}>
                    <Input
                      type={showPassword ? "text" : "password"}
                      id="customer-password"
                      value={customerPassword}
                      onChange={(e) => setCustomerPassword(e.target.value)}
                      required
                      placeholder=" "
                      className="peer h-12 pt-4 px-4 rounded-2xl transition-all duration-300 focus:ring-2 placeholder-transparent relative z-0 w-full"
                      style={{
                        backgroundColor: isDarkMode ? 'rgba(51, 65, 85, 0.5)' : 'rgba(255, 255, 255, 0.8)',
                        borderColor: isDarkMode ? '#475569' : '#cbd5e1',
                        borderWidth: '1px',
                        color: isDarkMode ? '#ffffff' : '#1e293b',
                        minHeight: '48px',
                        height: '48px',
                        display: 'block'
                      }}
                      disabled={isLoading}
                    />
                    <Label
                      htmlFor="customer-password"
                      className={`absolute left-4 z-10 pointer-events-none transition-all duration-300 
                        ${isDarkMode ? 'text-slate-400 peer-focus:text-cyan-400' : 'text-slate-500 peer-focus:text-cyan-600'}
                        peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-base
                        top-2 -translate-y-0 text-xs font-semibold`}
                    >
                      Password
                    </Label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute z-20 ${isDarkMode ? 'text-slate-400 hover:text-cyan-400' : 'text-slate-500 hover:text-cyan-600'} transition-colors`}
                      style={{ top: '50%', transform: 'translateY(-50%)', right: '12px' }}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>

                  {/* Remember Me & Forgot Password */}
                  <div className="flex items-center justify-between mb-8 mt-6">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="remember"
                        checked={rememberMe}
                        onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                        className={`${isDarkMode ? 'border-slate-600' : 'border-slate-400'} rounded-none`}
                      />
                      <label
                        htmlFor="remember"
                        className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'} cursor-pointer`}
                      >
                        Remember me
                      </label>
                    </div>
                    <button
                      type="button"
                      className="text-sm font-medium transition-colors"
                      style={{ color: isDarkMode ? '#22d3ee' : '#0891b2' }}
                    >
                      Forgot password?
                    </button>
                  </div>

                  {/* Gradient Login Button */}
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 text-white font-semibold rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] active:scale-95 mb-6"
                    style={{ background: 'linear-gradient(to right, #06b6d4, #3b82f6, #9333ea)' }}
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>
              </TabsContent>

              {/* Admin Login Form */}
              <TabsContent value="admin" className="mt-0 space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <form onSubmit={handleAdminLogin} className="space-y-5">
                  {/* Email Input with Floating Label */}
                  <div className="relative group mb-8" style={{ minHeight: '48px' }}>
                    <Input
                      type="email"
                      id="admin-email"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      required
                      placeholder=" "
                      className="peer h-12 pt-4 px-4 rounded-2xl transition-all duration-300 focus:ring-2 placeholder-transparent relative z-0 w-full"
                      style={{
                        backgroundColor: isDarkMode ? 'rgba(51, 65, 85, 0.5)' : 'rgba(255, 255, 255, 0.8)',
                        borderColor: isDarkMode ? '#475569' : '#cbd5e1',
                        borderWidth: '1px',
                        color: isDarkMode ? '#ffffff' : '#1e293b',
                        minHeight: '48px',
                        height: '48px',
                        display: 'block'
                      }}
                      disabled={isLoading}
                    />
                    <Label
                      htmlFor="admin-email"
                      className={`absolute left-4 z-10 pointer-events-none transition-all duration-300 
                        ${isDarkMode ? 'text-slate-400 peer-focus:text-purple-400' : 'text-slate-500 peer-focus:text-purple-600'}
                        peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-base
                        top-2 -translate-y-0 text-xs font-semibold`}
                    >
                      Enter id
                    </Label>
                  </div>

                  {/* Password Input with Show/Hide Toggle */}
                  <div className="relative group mb-8" style={{ minHeight: '48px' }}>
                    <Input
                      type={showPassword ? "text" : "password"}
                      id="admin-password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      required
                      placeholder=" "
                      className="peer h-12 pt-4 pr-12 px-4 rounded-2xl transition-all duration-300 focus:ring-2 placeholder-transparent relative z-0 w-full"
                      style={{
                        backgroundColor: isDarkMode ? 'rgba(51, 65, 85, 0.5)' : 'rgba(255, 255, 255, 0.8)',
                        borderColor: isDarkMode ? '#475569' : '#cbd5e1',
                        borderWidth: '1px',
                        color: isDarkMode ? '#ffffff' : '#1e293b',
                        minHeight: '48px',
                        height: '48px',
                        display: 'block'
                      }}
                      disabled={isLoading}
                    />
                    <Label
                      htmlFor="admin-password"
                      className={`absolute left-4 z-10 pointer-events-none transition-all duration-300 
                        ${isDarkMode ? 'text-slate-400 peer-focus:text-purple-400' : 'text-slate-500 peer-focus:text-purple-600'}
                        peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-base
                        top-2 -translate-y-0 text-xs font-semibold`}
                    >
                      Password
                    </Label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute z-20 ${isDarkMode ? 'text-slate-400 hover:text-purple-400' : 'text-slate-500 hover:text-purple-600'} transition-colors`}
                      style={{ top: '50%', transform: 'translateY(-50%)', right: '12px' }}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>

                  {/* Remember Me & Forgot Password */}
                  <div className="flex items-center justify-between mb-8 mt-6">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="remember-admin"
                        checked={rememberMe}
                        onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                        className={`${isDarkMode ? 'border-slate-600' : 'border-slate-400'} rounded-md`}
                      />
                      <label
                        htmlFor="remember-admin"
                        className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'} cursor-pointer`}
                      >
                        Remember me
                      </label>
                    </div>
                    <button
                      type="button"
                      className="text-sm font-medium transition-colors"
                      style={{ color: isDarkMode ? '#c084fc' : '#9333ea' }}
                    >
                      Forgot password?
                    </button>
                  </div>

                  {/* Gradient Login Button */}
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 text-white font-semibold rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] active:scale-95"
                    style={{ background: 'linear-gradient(to right, #9333ea, #ec4899, #a855f7)' }}
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      "Admin Sign In"
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Footer */}
        <p
          className="text-center mt-8 text-sm font-medium"
          style={{ color: isDarkMode ? '#cbd5e1' : 'rgba(255, 255, 255, 0.9)' }}
        >
          © 2026 CRM Platform. All rights reserved.
        </p>
      </div>

      {/* Custom Animations */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes blob {
            0% { transform: translate(0px, 0px) scale(1); }
            33% { transform: translate(30px, -50px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
            100% { transform: translate(0px, 0px) scale(1); }
          }
          .animate-blob {
            animation: blob 7s infinite;
          }
          .animation-delay-2000 {
            animation-delay: 2s;
          }
          .animation-delay-4000 {
            animation-delay: 4s;
          }
        `
      }} />
    </div>
  );
}
