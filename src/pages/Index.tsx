import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Users,
  Building2,
  BookOpen,
  HeartHandshake,
  TrendingUp,
  ShieldCheck,
  Globe,
} from "lucide-react";

const stats = [
  { value: "12,400+", label: "Community Members Served" },
  { value: "8", label: "Active Equity Programs" },
  { value: "34", label: "Partner Organizations" },
  { value: "97%", label: "Satisfaction Rate" },
];

const featuredPrograms = [
  {
    icon: Building2,
    title: "Equitable Permitting Access",
    description:
      "Streamlined permit assistance for small businesses and underserved neighborhoods, reducing barriers to entry and processing time.",
    tags: ["Small Business", "Permitting"],
    href: "/programs",
  },
  {
    icon: BookOpen,
    title: "Community Education Initiative",
    description:
      "Free workshops and one-on-one guidance sessions to help residents navigate development services and understand their rights.",
    tags: ["Education", "Outreach"],
    href: "/programs",
  },
  {
    icon: HeartHandshake,
    title: "Equity Navigator Program",
    description:
      "Dedicated advocates who work alongside underrepresented applicants to ensure fair and timely access to all development services.",
    tags: ["Advocacy", "Support"],
    href: "/programs",
  },
];

const values = [
  {
    icon: ShieldCheck,
    title: "Fairness",
    description: "Every applicant receives the same quality of service regardless of background.",
  },
  {
    icon: Globe,
    title: "Inclusion",
    description: "Services available in multiple languages with accessibility accommodations.",
  },
  {
    icon: TrendingUp,
    title: "Accountability",
    description: "We track outcomes and publish data to ensure continuous improvement.",
  },
  {
    icon: Users,
    title: "Community-Driven",
    description: "Programs shaped by the communities they serve through ongoing engagement.",
  },
];

export default function Index() {
  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-background py-20 lg:py-32">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl text-center">
          <Badge variant="secondary" className="mb-4">
            Development Services Department
          </Badge>
          <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
            Building an Equitable Future{" "}
            <span className="text-primary">for Every Community</span>
          </h1>
          <p className="text-lg lg:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            The One DSD Equity Program ensures every resident and business has fair, transparent,
            and accessible development services — no matter their background or zip code.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg">
              <Link to="/programs">
                Explore Programs <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/about">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y bg-muted/30 py-12">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map(({ value, label }) => (
              <div key={label}>
                <p className="text-3xl lg:text-4xl font-extrabold text-primary">{value}</p>
                <p className="text-sm text-muted-foreground mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl text-center">
          <Badge variant="outline" className="mb-4">Our Mission</Badge>
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Equity Isn't a Goal — It's Our Standard
          </h2>
          <p className="text-muted-foreground leading-relaxed text-lg">
            The One DSD Equity Program was established to dismantle systemic barriers within
            development services. We proactively identify gaps, deliver targeted programs, and
            hold ourselves accountable to the communities we serve.
          </p>
        </div>
      </section>

      {/* Featured Programs */}
      <section className="pb-16 lg:pb-24 bg-muted/20 py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">Programs</Badge>
            <h2 className="text-3xl font-bold">Featured Initiatives</h2>
            <p className="text-muted-foreground mt-2">
              Targeted programs designed to level the playing field.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {featuredPrograms.map(({ icon: Icon, title, description, tags, href }) => (
              <Card key={title} className="flex flex-col hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{title}</CardTitle>
                  <CardDescription>{description}</CardDescription>
                </CardHeader>
                <CardContent className="mt-auto">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link to={href}>
                      Learn More <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button asChild variant="ghost">
              <Link to="/programs">
                View All Programs <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">Our Values</Badge>
            <h2 className="text-3xl font-bold">What We Stand For</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map(({ icon: Icon, title, description }) => (
              <div key={title} className="text-center p-6 rounded-xl border bg-card hover:shadow-sm transition-shadow">
                <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4 lg:px-8 text-center max-w-2xl">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="mb-8 opacity-90">
            Whether you need permit assistance, educational resources, or a dedicated advocate —
            we're here to help. Apply today and connect with your equity navigator.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" variant="secondary">
              <Link to="/contact">Apply Now</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-primary-foreground/40 hover:bg-primary-foreground/10">
              <Link to="/resources">Browse Resources</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
