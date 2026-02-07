import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  LogOut,
  Upload,
  FileText,
  Globe,
  TrendingUp,
  Share2,
  Crown,
  Bell,
  User,
  Loader2,
} from "lucide-react";
import { FileUpload } from "../components/FileUpload";
import { ServiceUpdates } from "../components/ServiceUpdates";
import { supabase } from "../lib/supabase";
import { toast } from "sonner";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";

export function CustomerDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [serviceUpdates, setServiceUpdates] = useState<any[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/");
      return;
    }
    fetchDashboardData(user.id);
    fetchNotifications(user.id);
  };

  const fetchNotifications = async (userId: string) => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (data) setNotifications(data);
  };

  const fetchDashboardData = async (userId: string) => {
    setLoading(true);
    try {
      // 1. Fetch Profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;
      setUserProfile(profile);

      // 2. Fetch Service Updates
      const { data: updates, error: updatesError } = await supabase
        .from('service_updates')
        .select('*')
        .eq('customer_id', userId)
        .order('created_at', { ascending: false });

      if (updatesError) throw updatesError;
      setServiceUpdates(updates);

      // 3. Fetch Files
      const { data: files, error: filesError } = await supabase
        .from('files')
        .select('*')
        .eq('customer_id', userId)
        .order('uploaded_at', { ascending: false });

      if (filesError) throw filesError;
      setUploadedFiles(files);

    } catch (error: any) {
      toast.error("Error loading dashboard: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleUpgradeRequest = async (plan: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          title: "Plan Upgrade Request",
          message: `${userProfile?.full_name || user.email} wants to upgrade to ${plan} plan.`,
          type: 'upgrade_request'
        });

      if (error) throw error;
      toast.success("Upgrade request sent to admin! They will contact you shortly.");
    } catch (error: any) {
      toast.error("Failed to send request: " + error.message);
    }
  };

  const handleFileUpload = async (files: File[]) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    for (const file of files) {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        // 1. Upload to Storage
        const { error: uploadError } = await supabase.storage
          .from('crm-files')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // 2. Save reference in database
        const { error: dbError } = await supabase
          .from('files')
          .insert({
            customer_id: user.id,
            name: file.name,
            file_path: filePath,
            size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
          });

        if (dbError) throw dbError;

        toast.success(`File ${file.name} uploaded successfully!`);
      } catch (error: any) {
        toast.error(`Upload failed for ${file.name}: ${error.message}`);
      }
    }
    fetchDashboardData(user.id);
  };

  const handleDownload = async (filePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('crm-files')
        .download(filePath);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.click();
    } catch (error: any) {
      toast.error("Download failed: " + error.message);
    }
  };

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f9fc]">
        <Loader2 className="w-8 h-8 animate-spin text-[#6A89A7]" />
      </div>
    );
  }

  // Define service tiers
  const isServiceLocked = (serviceName: string) => {
    const plan = userProfile?.membership || "Basic";
    const name = serviceName.toLowerCase();

    if (plan === "Premium") return false;
    if (plan === "Pro") {
      return !["website", "seo"].includes(name);
    }
    // Basic plan
    return name !== "website";
  };

  // Get all services that should be visible
  const standardServices = ["Website", "SEO", "Social Media"];
  const customServices = Array.from(new Set(
    serviceUpdates
      .map(u => u.service)
      .filter(s => !standardServices.includes(s))
  ));

  const allServices = [...standardServices, ...customServices];

  // Helper to get latest progress for a service
  const getLatestProgress = (serviceName: string) => {
    const update = serviceUpdates.find(u => u.service.toLowerCase() === serviceName.toLowerCase());
    return update ? update.progress : 0;
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const getServiceIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case "website": return <Globe className="w-5 h-5 text-[#6A89A7]" />;
      case "seo": return <TrendingUp className="w-5 h-5 text-[#6A89A7]" />;
      case "social media": return <Share2 className="w-5 h-5 text-[#6A89A7]" />;
      default: return <Crown className="w-5 h-5 text-[#6A89A7]" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f9fc] to-[#BDDDFC]/20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6A89A7] to-[#88BDF2] flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-[#384959]">Customer Dashboard</h1>
                <p className="text-sm text-gray-500">Welcome back, {userProfile?.full_name || 'Customer'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative text-[#6A89A7]">
                      <Bell className="w-5 h-5" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                          {unreadCount}
                        </span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-0" align="end">
                    <div className="p-4 border-b border-gray-100">
                      <h3 className="font-semibold text-[#384959]">Notifications</h3>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((n) => (
                          <div key={n.id} className="p-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                            <p className="text-sm font-medium text-[#384959]">{n.title}</p>
                            <p className="text-xs text-gray-500 mt-1">{n.message}</p>
                            <p className="text-[10px] text-gray-400 mt-2">
                              {new Date(n.created_at).toLocaleDateString()}
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
              </div>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="border-[#6A89A7] text-[#6A89A7] hover:bg-[#6A89A7] hover:text-white"
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
        {/* Membership Status Card */}
        <Card className="mb-8 border-none shadow-lg bg-gradient-to-br from-[#6A89A7] to-[#88BDF2] text-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Crown className="w-8 h-8" />
                <div>
                  <CardTitle className="text-2xl">
                    {userProfile?.membership || 'Basic'} Plan
                  </CardTitle>
                  <CardDescription className="text-white/80">
                    Status: {userProfile?.status || 'Active'}
                  </CardDescription>
                </div>
              </div>
              <Button
                variant="secondary"
                onClick={() => handleUpgradeRequest('Pro')}
                className="bg-white text-[#6A89A7] hover:bg-white/90"
              >
                Upgrade Plan
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-white/80 mb-2">Plan Features</p>
                <ul className="space-y-2">
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-white" />
                    <span>Website Management</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-white" />
                    <span>SEO Optimization</span>
                  </li>
                </ul>
              </div>
              <div>
                <p className="text-sm text-white/80 mb-2">Join Date</p>
                <p className="text-xl font-semibold">{userProfile?.join_date || userProfile?.created_at?.split('T')[0]}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dashboard Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white border border-gray-200">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="files">My Files</TabsTrigger>
            <TabsTrigger value="updates">Service Updates</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              {allServices.map((serviceName) => {
                const locked = isServiceLocked(serviceName);
                const progress = getLatestProgress(serviceName);

                return (
                  <Card key={serviceName} className={`relative border-none shadow-lg hover:shadow-xl transition-shadow overflow-hidden ${locked ? 'opacity-75 grayscale-[0.5]' : ''}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{serviceName}</CardTitle>
                        {getServiceIcon(serviceName)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Progress</span>
                            <span className="font-semibold text-[#6A89A7]">{progress}%</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                        <p className="text-sm text-gray-600 truncate">
                          {progress === 100 ? "Service completed" : "Work in progress..."}
                        </p>
                        <Badge className={progress === 100 ? "bg-green-500 text-white" : "bg-[#88BDF2] text-white"}>
                          {progress === 100 ? "Completed" : "Active"}
                        </Badge>
                      </div>
                    </CardContent>

                    {locked && (
                      <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex flex-col items-center justify-center p-4 text-center z-10 transition-all hover:bg-white/40">
                        <div className="w-10 h-10 rounded-full bg-[#384959] flex items-center justify-center mb-2 shadow-lg">
                          <Crown className="w-5 h-5 text-yellow-400" />
                        </div>
                        <p className="text-sm font-bold text-[#384959]">Upgrade to Unlock</p>
                        <p className="text-[10px] text-gray-600">This service is not in your {userProfile?.membership} plan</p>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>

            {/* Recent Updates */}
            <Card className="border-none shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recent Service Updates</CardTitle>
                    <CardDescription>Latest updates on your services</CardDescription>
                  </div>
                  <Button
                    variant="link"
                    onClick={() => setActiveTab("updates")}
                    className="text-[#6A89A7] hover:text-[#88BDF2]"
                  >
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {serviceUpdates.length > 0 ? (
                  <ServiceUpdates updates={serviceUpdates.slice(0, 3)} />
                ) : (
                  <p className="text-gray-500 text-center py-4">No service updates yet.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Files Tab */}
          <TabsContent value="files" className="space-y-6">
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle>Upload Files</CardTitle>
                <CardDescription>
                  Upload documents, images, or other files for your projects
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FileUpload onUpload={handleFileUpload} />
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle>Uploaded Files</CardTitle>
                <CardDescription>
                  Your previously uploaded files ({uploadedFiles.length} total)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {uploadedFiles.length > 0 ? (
                    uploadedFiles.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <FileText className="w-5 h-5 text-[#6A89A7]" />
                          <div>
                            <p className="font-medium text-[#384959]">{file.name}</p>
                            <p className="text-sm text-gray-500">
                              Uploaded on {file.uploaded_at?.split('T')[0]} • {file.size}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(file.file_path, file.name)}
                          className="text-[#6A89A7] hover:text-[#88BDF2]"
                        >
                          Download
                        </Button>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">No files uploaded yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Service Updates Tab */}
          <TabsContent value="updates" className="space-y-6">
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle>All Service Updates</CardTitle>
                <CardDescription>
                  Complete timeline of all your service updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                {serviceUpdates.length > 0 ? (
                  <ServiceUpdates updates={serviceUpdates} />
                ) : (
                  <p className="text-gray-500 text-center py-4">No service updates found.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}