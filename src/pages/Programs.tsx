import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowRight,
  Building2,
  BookOpen,
  HeartHandshake,
  Globe,
  Wrench,
  Landmark,
} from "lucide-react";

const programs = {
  all: [
    {
      icon: Building2,
      title: "Equitable Permitting Access",
      description:
        "Provides permit application assistance, fee waivers, and priority processing for qualifying small businesses and property owners in underserved zip codes.",
      audience: "Small Business Owners",
      status: "Open",
      category: "business",
      tags: ["Permitting", "Fee Waiver", "Small Business"],
    },
    {
      icon: HeartHandshake,
      title: "Equity Navigator Program",
      description:
        "Pairs applicants from underrepresented communities with a dedicated Navigator who provides personalized guidance throughout the entire development services process.",
      audience: "All Residents",
      status: "Open",
      category: "advocacy",
      tags: ["Advocacy", "1-on-1 Support", "Guided Access"],
    },
    {
      icon: BookOpen,
      title: "Community Education Initiative",
      description:
        "Free workshops, webinars, and informational guides covering zoning, permits, inspections, and appeals — offered in multiple languages at community locations.",
      audience: "Community Members",
      status: "Open",
      category: "education",
      tags: ["Workshops", "Multi-Language", "Free"],
    },
    {
      icon: Globe,
      title: "Language Access Program",
      description:
        "Provides interpretation and translation services for all development services transactions and documents in over 10 languages.",
      audience: "Non-English Speakers",
      status: "Open",
      category: "advocacy",
      tags: ["Translation", "Interpretation", "Multilingual"],
    },
    {
      icon: Wrench,
      title: "Small Contractor Equity Initiative",
      description:
        "Connects minority-owned and women-owned contracting businesses with city contracts, mentorship, and bid assistance to grow their participation in public projects.",
      audience: "Contractors & Vendors",
      status: "Open",
      category: "business",
      tags: ["MWBE", "Contracting", "Mentorship"],
    },
    {
      icon: Landmark,
      title: "Historic Preservation Equity Fund",
      description:
        "Grants and technical assistance for owners of historic properties in low-income areas to maintain and rehabilitate structures without losing community character.",
      audience: "Property Owners",
      status: "Limited",
      category: "housing",
      tags: ["Historic", "Grants", "Preservation"],
    },
  ],
};

const categories = [
  { value: "all", label: "All Programs" },
  { value: "business", label: "Business" },
  { value: "advocacy", label: "Advocacy" },
  { value: "education", label: "Education" },
  { value: "housing", label: "Housing" },
];

const statusColor: Record<string, string> = {
  Open: "bg-green-100 text-green-800",
  Limited: "bg-yellow-100 text-yellow-800",
  Closed: "bg-red-100 text-red-800",
};

export default function Programs() {
  return (
    <div>
      {/* Header */}
      <section className="bg-muted/30 border-b py-16 lg:py-20">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl text-center">
          <Badge variant="secondary" className="mb-4">Programs & Services</Badge>
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
            Our Equity Programs
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Targeted initiatives designed to remove barriers and create pathways to equitable
            development services for every community we serve.
          </p>
        </div>
      </section>

      {/* Programs Tabs */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <Tabs defaultValue="all">
            <div className="flex justify-center mb-10">
              <TabsList>
                {categories.map(({ value, label }) => (
                  <TabsTrigger key={value} value={value} className="text-xs sm:text-sm">
                    {label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {categories.map(({ value }) => (
              <TabsContent key={value} value={value}>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {programs.all
                    .filter((p) => value === "all" || p.category === value)
                    .map(({ icon: Icon, title, description, audience, status, tags }) => (
                      <Card key={title} className="flex flex-col hover:shadow-md transition-shadow">
                        <CardHeader>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                              <Icon className="h-5 w-5 text-primary" />
                            </div>
                            <span
                              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColor[status]}`}
                            >
                              {status}
                            </span>
                          </div>
                          <CardTitle className="text-base">{title}</CardTitle>
                          <CardDescription className="text-sm leading-relaxed">
                            {description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="mt-auto">
                          <p className="text-xs text-muted-foreground mb-3">
                            <span className="font-medium">Audience:</span> {audience}
                          </p>
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <Button asChild variant="outline" size="sm" className="w-full">
                            <Link to="/contact">
                              Apply / Learn More <ArrowRight className="ml-1 h-3 w-3" />
                            </Link>
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* Eligibility Banner */}
      <section className="bg-muted/30 border-y py-12">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl text-center">
          <h2 className="text-2xl font-bold mb-3">Not Sure Which Program Fits?</h2>
          <p className="text-muted-foreground mb-6">
            Our Equity Navigators can help assess your needs and match you with the right
            resources — at no cost to you.
          </p>
          <Button asChild>
            <Link to="/contact">
              Talk to a Navigator <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
