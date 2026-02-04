import { Badge } from "./ui/badge";
import { Globe, TrendingUp, Share2, Clock, CheckCircle2 } from "lucide-react";

interface ServiceUpdate {
  id: number;
  service: string;
  title: string;
  description: string;
  date: string;
  status: "completed" | "in-progress";
}

interface ServiceUpdatesProps {
  updates: ServiceUpdate[];
}

export function ServiceUpdates({ updates }: ServiceUpdatesProps) {
  const getServiceIcon = (service: string) => {
    switch (service.toLowerCase()) {
      case "website":
        return <Globe className="w-5 h-5" />;
      case "seo":
        return <TrendingUp className="w-5 h-5" />;
      case "social media":
        return <Share2 className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  const getServiceColor = (service: string) => {
    switch (service.toLowerCase()) {
      case "website":
        return "bg-[#6A89A7] text-white";
      case "seo":
        return "bg-[#88BDF2] text-white";
      case "social media":
        return "bg-[#BDDDFC] text-[#384959]";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-4">
      {updates.map((update, index) => (
        <div
          key={update.id}
          className="relative pl-8 pb-6 border-l-2 border-gray-200 last:border-l-0 last:pb-0"
        >
          {/* Timeline dot */}
          <div
            className={`absolute left-0 -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center ${getServiceColor(
              update.service
            )}`}
          >
            {getServiceIcon(update.service)}
          </div>

          {/* Content */}
          <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-100">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className="font-semibold text-[#384959]">{update.title}</h4>
                  {update.status === "completed" ? (
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Completed
                    </Badge>
                  ) : (
                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                      <Clock className="w-3 h-3 mr-1" />
                      In Progress
                    </Badge>
                  )}
                </div>
                <Badge variant="outline" className="text-xs">
                  {update.service}
                </Badge>
              </div>
              <span className="text-sm text-gray-500">{formatDate(update.date)}</span>
            </div>
            <p className="text-sm text-gray-600">{update.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
