import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

interface Customer {
  id: number;
  name: string;
  email: string;
  membership: string;
  status: string;
  joinDate: string;
  filesCount: number;
}

interface AnalyticsChartsProps {
  customers: Customer[];
}

export function AnalyticsCharts({ customers }: AnalyticsChartsProps) {
  // Membership distribution data
  const membershipData = [
    {
      name: "Basic",
      count: customers.filter((c) => c.membership === "Basic").length,
      color: "#BDDDFC",
    },
    {
      name: "Pro",
      count: customers.filter((c) => c.membership === "Pro").length,
      color: "#88BDF2",
    },
    {
      name: "Premium",
      count: customers.filter((c) => c.membership === "Premium").length,
      color: "#6A89A7",
    },
  ];

  // Customer growth over time (mock data)
  const growthData = [
    { month: "Oct", customers: 1 },
    { month: "Nov", customers: 2 },
    { month: "Dec", customers: 3 },
    { month: "Jan", customers: 5 },
    { month: "Feb", customers: 5 },
  ];

  // File upload trends (mock data)
  const uploadData = [
    { month: "Oct", uploads: 5 },
    { month: "Nov", uploads: 8 },
    { month: "Dec", uploads: 12 },
    { month: "Jan", uploads: 18 },
    { month: "Feb", uploads: 18 },
  ];

  // Service updates distribution (mock data)
  const serviceData = [
    { service: "Website", updates: 45 },
    { service: "SEO", updates: 38 },
    { service: "Social Media", updates: 52 },
  ];

  const COLORS = ["#BDDDFC", "#88BDF2", "#6A89A7"];

  return (
    <div className="space-y-6">
      {/* Membership Distribution */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle>Membership Distribution</CardTitle>
            <CardDescription>Active customers by plan type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={membershipData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, count }) => `${name}: ${count}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {membershipData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex justify-center gap-4">
              {membershipData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-gray-600">
                    {item.name}: {item.count}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle>Service Updates Distribution</CardTitle>
            <CardDescription>Updates per service type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={serviceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="service" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="updates" fill="#6A89A7" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Growth Trends */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle>Customer Growth</CardTitle>
            <CardDescription>Total customers over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={growthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="customers"
                    stroke="#6A89A7"
                    strokeWidth={3}
                    dot={{ fill: "#6A89A7", r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle>File Upload Trends</CardTitle>
            <CardDescription>Total file uploads over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={uploadData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="uploads"
                    stroke="#88BDF2"
                    strokeWidth={3}
                    dot={{ fill: "#88BDF2", r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Stats */}
      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle>Key Metrics Summary</CardTitle>
          <CardDescription>Important statistics at a glance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-gradient-to-br from-[#6A89A7]/10 to-[#88BDF2]/10 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
              <p className="text-2xl font-bold text-[#6A89A7]">$3,296</p>
              <p className="text-xs text-gray-500 mt-1">Monthly recurring</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-[#88BDF2]/10 to-[#BDDDFC]/10 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Avg. Files per Customer</p>
              <p className="text-2xl font-bold text-[#88BDF2]">
                {(customers.reduce((sum, c) => sum + c.filesCount, 0) / customers.length).toFixed(1)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Across all customers</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-[#BDDDFC]/10 to-[#6A89A7]/10 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Active Rate</p>
              <p className="text-2xl font-bold text-[#6A89A7]">
                {((customers.filter((c) => c.status === "Active").length / customers.length) * 100).toFixed(0)}%
              </p>
              <p className="text-xs text-gray-500 mt-1">Customer engagement</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-[#6A89A7]/10 to-[#BDDDFC]/10 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Growth Rate</p>
              <p className="text-2xl font-bold text-green-600">+25%</p>
              <p className="text-xs text-gray-500 mt-1">Last 30 days</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}