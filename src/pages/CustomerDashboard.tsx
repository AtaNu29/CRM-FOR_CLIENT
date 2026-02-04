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

export function CustomerDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [serviceUpdates, setServiceUpdates] = useState<any[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [notifications] = useState([
    "New SEO report available",
    "Website update completed",
  ]);

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
        .order('date', { ascending: false });

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
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="w-5 h-5 text-[#6A89A7]" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                      {notifications.length}
                    </span>
                  )}
                </Button>
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
                onClick={() => navigate("/membership-plans")}
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
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-white border border-gray-200">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="files">My Files</TabsTrigger>
            <TabsTrigger value="updates">Service Updates</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Website</CardTitle>
                    <Globe className="w-5 h-5 text-[#6A89A7]" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-semibold text-[#6A89A7]">75%</span>
                      </div>
                      <Progress value={75} className="h-2" />
                    </div>
                    <p className="text-sm text-gray-600">
                      Website updates in progress
                    </p>
                    <Badge className="bg-[#88BDF2] text-white">Active</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">SEO</CardTitle>
                    <TrendingUp className="w-5 h-5 text-[#6A89A7]" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-semibold text-[#6A89A7]">90%</span>
                      </div>
                      <Progress value={90} className="h-2" />
                    </div>
                    <p className="text-sm text-gray-600">
                      Keyword optimization on track
                    </p>
                    <Badge className="bg-green-500 text-white">On Track</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Social Media</CardTitle>
                    <Share2 className="w-5 h-5 text-[#6A89A7]" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-semibold text-[#6A89A7]">60%</span>
                      </div>
                      <Progress value={60} className="h-2" />
                    </div>
                    <p className="text-sm text-gray-600">
                      Content creation active
                    </p>
                    <Badge className="bg-[#88BDF2] text-white">Active</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Updates */}
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle>Recent Service Updates</CardTitle>
                <CardDescription>Latest updates on your services</CardDescription>
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