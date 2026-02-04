import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { FileText, Download, Globe, TrendingUp, Share2 } from "lucide-react";
import { UpdateServiceProgress } from "./UpdateServiceProgress";

interface Customer {
  id: number;
  name: string;
  email: string;
  membership: string;
  status: string;
  joinDate: string;
  filesCount: number;
}

interface CustomerDetailsProps {
  customer: Customer;
}

// Mock files data
const mockFiles = [
  { id: 1, name: "Brand Guidelines.pdf", uploadDate: "2026-01-15", size: "2.4 MB" },
  { id: 2, name: "Product Images.zip", uploadDate: "2026-01-20", size: "15.8 MB" },
  { id: 3, name: "Content Requirements.docx", uploadDate: "2026-01-22", size: "156 KB" },
];

// Mock service updates
const mockUpdates = [
  {
    id: 1,
    service: "Website",
    title: "Homepage redesign completed",
    description: "Updated homepage with new hero section and testimonials",
    date: "2026-02-01",
    progress: 100,
  },
  {
    id: 2,
    service: "SEO",
    title: "Keyword research and optimization",
    description: "Optimized 15 pages for target keywords",
    date: "2026-01-28",
    progress: 90,
  },
  {
    id: 3,
    service: "Social Media",
    title: "February content calendar",
    description: "Created and scheduled 20 posts",
    date: "2026-01-25",
    progress: 60,
  },
];

export function CustomerDetails({ customer }: CustomerDetailsProps) {
  const [updates, setUpdates] = useState(mockUpdates);
  const [showUpdateForm, setShowUpdateForm] = useState(false);

  const handleAddUpdate = (service: string, title: string, description: string, progress: number) => {
    const newUpdate = {
      id: updates.length + 1,
      service,
      title,
      description,
      date: new Date().toISOString().split("T")[0],
      progress,
    };
    setUpdates([newUpdate, ...updates]);
    setShowUpdateForm(false);
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

  return (
    <div className="space-y-6">
      {/* Customer Info */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="font-medium">{customer.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium">{customer.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Membership</p>
              <Badge className="bg-[#6A89A7] text-white">{customer.membership}</Badge>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <Badge className="bg-green-100 text-green-700">{customer.status}</Badge>
            </div>
            <div>
              <p className="text-sm text-gray-600">Join Date</p>
              <p className="font-medium">{customer.joinDate}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Files</p>
              <p className="font-medium">{customer.filesCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Files and Updates */}
      <Tabs defaultValue="files">
        <TabsList>
          <TabsTrigger value="files">Uploaded Files</TabsTrigger>
          <TabsTrigger value="updates">Service Updates</TabsTrigger>
        </TabsList>

        <TabsContent value="files" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Uploaded Files ({mockFiles.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-[#6A89A7]" />
                      <div>
                        <p className="font-medium text-[#384959]">{file.name}</p>
                        <p className="text-sm text-gray-500">
                          Uploaded on {file.uploadDate} • {file.size}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-[#6A89A7] hover:text-[#88BDF2]"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="updates" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Service Updates ({updates.length})</CardTitle>
                {!showUpdateForm && (
                  <Button
                    onClick={() => setShowUpdateForm(true)}
                    className="bg-[#6A89A7] hover:bg-[#88BDF2] text-white"
                  >
                    Add Update
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {showUpdateForm && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <UpdateServiceProgress
                    onAdd={handleAddUpdate}
                    onCancel={() => setShowUpdateForm(false)}
                  />
                </div>
              )}
              <div className="space-y-3">
                {updates.map((update) => (
                  <div
                    key={update.id}
                    className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getServiceIcon(update.service)}
                        <h4 className="font-semibold text-[#384959]">{update.title}</h4>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {update.service}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{update.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">{update.date}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-[#6A89A7] h-2 rounded-full"
                            style={{ width: `${update.progress}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-[#6A89A7]">
                          {update.progress}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
