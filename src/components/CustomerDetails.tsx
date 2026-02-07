import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { FileText, Download, Globe, TrendingUp, Share2, Loader2, Save } from "lucide-react";
import { UpdateServiceProgress } from "./UpdateServiceProgress";
import { supabase } from "../lib/supabase";
import { toast } from "sonner";

interface Customer {
  id: string;
  name: string;
  email: string;
  membership: string;
  status: string;
  joinDate: string;
  filesCount: number;
}

interface CustomerDetailsProps {
  customer: Customer;
  onUpdate?: () => void;
}

export function CustomerDetails({ customer, onUpdate }: CustomerDetailsProps) {
  const [updates, setUpdates] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedMembership, setEditedMembership] = useState(customer.membership);
  const [editedStatus, setEditedStatus] = useState(customer.status);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchCustomerData();
  }, [customer.id]);

  const fetchCustomerData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Service Updates
      const { data: updatesData, error: updatesError } = await supabase
        .from("service_updates")
        .select("*")
        .eq("customer_id", customer.id)
        .order("created_at", { ascending: false });

      if (updatesError) throw updatesError;
      setUpdates(updatesData || []);

      // 2. Fetch Files
      const { data: filesData, error: filesError } = await supabase
        .from("files")
        .select("*")
        .eq("customer_id", customer.id)
        .order("uploaded_at", { ascending: false });

      if (filesError) throw filesError;
      setFiles(filesData || []);

    } catch (error: any) {
      toast.error("Error fetching customer details: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUpdate = async (service: string, title: string, description: string, progress: number) => {
    try {
      const { error } = await supabase
        .from("service_updates")
        .insert({
          customer_id: customer.id,
          service,
          title,
          description,
          date: new Date().toISOString().split("T")[0],
          progress,
        });

      if (error) throw error;

      toast.success("Update added successfully!");
      setShowUpdateForm(false);
      fetchCustomerData(); // Refresh list
    } catch (error: any) {
      toast.error("Failed to add update: " + error.message);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          membership: editedMembership,
          status: editedStatus
        })
        .eq("id", customer.id);

      if (error) throw error;

      toast.success("Profile updated successfully!");
      setEditMode(false);
      if (onUpdate) onUpdate();
    } catch (error: any) {
      toast.error("Failed to update profile: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownload = async (filePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from("crm-files")
        .download(filePath);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      link.click();
    } catch (error: any) {
      toast.error("Download failed: " + error.message);
    }
  };

  const getServiceIcon = (service: string) => {
    switch (service.toLowerCase()) {
      case "website":
        return <Globe className="w-4 h-4" />;
      case "seo":
        return <TrendingUp className="w-4 h-4" />;
      case "social media":
        return <Share2 className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case "Basic": return "bg-[#BDDDFC] text-[#384959]";
      case "Pro": return "bg-[#88BDF2] text-white";
      case "Premium": return "bg-[#6A89A7] text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const getStatusColor = (status: string) => {
    return status === "Active"
      ? "bg-green-100 text-green-700"
      : "bg-red-100 text-red-700";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-[#6A89A7]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Customer Info */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Customer Information</CardTitle>
            <CardDescription>Manage user membership and status</CardDescription>
          </div>
          <Button
            variant={editMode ? "outline" : "default"}
            onClick={() => editMode ? setEditMode(false) : setEditMode(true)}
            className={!editMode ? "bg-[#6A89A7] hover:bg-[#88BDF2] text-white" : ""}
          >
            {editMode ? "Cancel" : "Edit Profile"}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <p className="text-sm text-gray-600 font-medium">Name</p>
              <p className="text-lg">{customer.name}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-600 font-medium">Email</p>
              <p className="text-lg">{customer.email}</p>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-gray-600 font-medium">Membership Plan</p>
              {editMode ? (
                <Select value={editedMembership} onValueChange={setEditedMembership}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Basic">Basic</SelectItem>
                    <SelectItem value="Pro">Pro</SelectItem>
                    <SelectItem value="Premium">Premium</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Badge className={getPlanColor(customer.membership)}>{customer.membership}</Badge>
              )}
            </div>

            <div className="space-y-1">
              <p className="text-sm text-gray-600 font-medium">Account Status</p>
              {editMode ? (
                <Select value={editedStatus} onValueChange={setEditedStatus}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Badge className={getStatusColor(customer.status)}>{customer.status}</Badge>
              )}
            </div>

            <div className="space-y-1">
              <p className="text-sm text-gray-600 font-medium">Join Date</p>
              <p className="text-lg font-medium">{customer.joinDate}</p>
            </div>
          </div>

          {editMode && (
            <div className="mt-6 flex justify-end">
              <Button
                onClick={handleSaveProfile}
                className="bg-green-600 hover:bg-green-700 text-white"
                disabled={isSaving}
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                Save Changes
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs for Files and Updates */}
      <Tabs defaultValue="updates" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="updates">Service Updates</TabsTrigger>
          <TabsTrigger value="files">Uploaded Files</TabsTrigger>
        </TabsList>

        <TabsContent value="updates" className="space-y-4 pt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Service Updates</CardTitle>
                <CardDescription>Timeline of progress for this customer</CardDescription>
              </div>
              {!showUpdateForm && (
                <Button
                  onClick={() => setShowUpdateForm(true)}
                  className="bg-[#6A89A7] hover:bg-[#88BDF2] text-white"
                >
                  Add Update
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {showUpdateForm && (
                <div className="mb-6 p-4 border border-[#BDDDFC] bg-[#f5f9fc] rounded-lg">
                  <UpdateServiceProgress
                    onAdd={handleAddUpdate}
                    onCancel={() => setShowUpdateForm(false)}
                  />
                </div>
              )}
              <div className="space-y-4">
                {updates.length > 0 ? (
                  updates.map((update) => (
                    <div
                      key={update.id}
                      className="p-4 bg-white border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <div className="p-2 bg-[#f5f9fc] rounded-full text-[#6A89A7]">
                            {getServiceIcon(update.service)}
                          </div>
                          <div>
                            <h4 className="font-semibold text-[#384959]">{update.title}</h4>
                            <p className="text-xs text-gray-500">{update.date}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs font-normal">
                          {update.service}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-4 bg-gray-50 p-3 rounded">{update.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex-1 mr-4">
                          <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="bg-[#6A89A7] h-full rounded-full transition-all duration-500"
                              style={{ width: `${update.progress}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-sm font-bold text-[#6A89A7]">
                          {update.progress}%
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                    <p className="text-gray-500">No service updates yet. Click "Add Update" to start tracking progress.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="files" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Files</CardTitle>
              <CardDescription>Documents and assets uploaded by the customer</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {files.length > 0 ? (
                  files.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-white rounded shadow-sm text-[#6A89A7]">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium text-[#384959]">{file.name}</p>
                          <p className="text-xs text-gray-500">
                            Uploaded on {file.uploaded_at?.split("T")[0]} • {file.size}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(file.file_path, file.name)}
                        className="text-[#6A89A7] hover:text-[#88BDF2] hover:bg-transparent px-0"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                    <p className="text-gray-500">No files have been uploaded by this customer yet.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
