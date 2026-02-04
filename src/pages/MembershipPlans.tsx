import { useNavigate } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Check, Crown, ArrowLeft } from "lucide-react";

const plans = [
  {
    id: 1,
    name: "Basic",
    price: "$299",
    period: "/month",
    description: "Perfect for small businesses getting started",
    color: "from-[#BDDDFC] to-[#88BDF2]",
    buttonColor: "bg-[#BDDDFC] hover:bg-[#88BDF2] text-[#384959]",
    features: [
      "Basic Website Management",
      "Monthly SEO Reports",
      "Social Media Setup",
      "2 Content Updates/Month",
      "Email Support",
      "1 GB File Storage",
    ],
    popular: false,
  },
  {
    id: 2,
    name: "Pro",
    price: "$599",
    period: "/month",
    description: "Ideal for growing businesses",
    color: "from-[#88BDF2] to-[#6A89A7]",
    buttonColor: "bg-[#88BDF2] hover:bg-[#6A89A7] text-white",
    features: [
      "Advanced Website Management",
      "Weekly SEO Optimization",
      "Social Media Management (3 platforms)",
      "8 Content Updates/Month",
      "Priority Email & Chat Support",
      "10 GB File Storage",
      "Monthly Performance Reports",
      "Keyword Research",
    ],
    popular: true,
  },
  {
    id: 3,
    name: "Premium",
    price: "$999",
    period: "/month",
    description: "For businesses that demand the best",
    color: "from-[#6A89A7] to-[#384959]",
    buttonColor: "bg-[#6A89A7] hover:bg-[#384959] text-white",
    features: [
      "Full Website Management & Development",
      "Daily SEO Monitoring & Optimization",
      "Social Media Management (All platforms)",
      "Unlimited Content Updates",
      "24/7 Priority Support",
      "Unlimited File Storage",
      "Weekly Performance Reports",
      "Advanced Analytics Dashboard",
      "Dedicated Account Manager",
      "Custom Integrations",
    ],
    popular: false,
  },
];

export function MembershipPlans() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f9fc] to-[#BDDDFC]/20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4 text-[#6A89A7] hover:text-[#88BDF2]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="text-center">
            <h1 className="text-4xl font-bold text-[#384959] mb-2">
              Choose Your Perfect Plan
            </h1>
            <p className="text-lg text-gray-600">
              Select the plan that best fits your business needs
            </p>
          </div>
        </div>
      </header>

      {/* Pricing Cards */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative border-none shadow-xl hover:shadow-2xl transition-all ${
                plan.popular ? "ring-2 ring-[#6A89A7] scale-105" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-[#6A89A7] text-white px-4 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className={`bg-gradient-to-br ${plan.color} text-white rounded-t-lg pb-8`}>
                <div className="flex items-center justify-center mb-4">
                  <Crown className="w-8 h-8" />
                </div>
                <CardTitle className="text-2xl text-center">{plan.name}</CardTitle>
                <CardDescription className="text-white/90 text-center">
                  {plan.description}
                </CardDescription>
                <div className="text-center mt-4">
                  <span className="text-5xl font-bold">{plan.price}</span>
                  <span className="text-lg text-white/80">{plan.period}</span>
                </div>
              </CardHeader>

              <CardContent className="pt-8 pb-8">
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button className={`w-full ${plan.buttonColor}`}>
                  Choose {plan.name}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center">
          <Card className="max-w-2xl mx-auto border-none shadow-lg">
            <CardHeader>
              <CardTitle>Need a Custom Plan?</CardTitle>
              <CardDescription>
                We can create a tailored solution for your unique business needs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-6">
                Contact our team to discuss enterprise solutions, custom integrations,
                and special pricing for large organizations.
              </p>
              <Button className="bg-[#6A89A7] hover:bg-[#88BDF2] text-white">
                Contact Sales
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center text-[#384959] mb-8">
            Frequently Asked Questions
          </h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Can I upgrade my plan later?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Yes! You can upgrade or downgrade your plan at any time. Changes will
                  be reflected in your next billing cycle.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">What payment methods do you accept?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  We accept all major credit cards, PayPal, and bank transfers for
                  annual subscriptions.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Is there a setup fee?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  No setup fees! All plans include free onboarding and initial setup
                  assistance from our team.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Can I cancel anytime?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Yes, you can cancel your subscription at any time. Your access will
                  continue until the end of your billing period.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
