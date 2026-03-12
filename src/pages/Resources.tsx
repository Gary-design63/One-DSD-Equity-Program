import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FileText,
  Video,
  Link as LinkIcon,
  Download,
  Search,
  Phone,
  Globe,
} from "lucide-react";
import { useState } from "react";

const resources = [
  {
    category: "Guides & Handbooks",
    icon: FileText,
    items: [
      {
        title: "Permit Application Guide (English)",
        description: "Step-by-step walkthrough of the full permit application process.",
        type: "PDF",
      },
      {
        title: "Permit Application Guide (Spanish)",
        description: "Guía paso a paso del proceso de solicitud de permisos.",
        type: "PDF",
      },
      {
        title: "Small Business Development Services Handbook",
        description: "Comprehensive resource for business owners navigating DSD services.",
        type: "PDF",
      },
      {
        title: "Zoning & Land Use Quick Reference",
        description: "Plain-language summary of zoning codes and what they mean for your project.",
        type: "PDF",
      },
    ],
  },
  {
    category: "Video Tutorials",
    icon: Video,
    items: [
      {
        title: "How to Submit a Permit Online",
        description: "A 10-minute walkthrough of the online permit portal.",
        type: "Video",
      },
      {
        title: "Understanding the Appeals Process",
        description: "What to do if your permit is denied — your rights and options.",
        type: "Video",
      },
      {
        title: "Equity Navigator: What to Expect",
        description: "A navigator explains the support they provide from application to approval.",
        type: "Video",
      },
    ],
  },
  {
    category: "External Resources",
    icon: LinkIcon,
    items: [
      {
        title: "City Development Services Portal",
        description: "Access the official online permit and inspection portal.",
        type: "Link",
      },
      {
        title: "Community Legal Aid – Housing Rights",
        description: "Free legal assistance for housing and development disputes.",
        type: "Link",
      },
      {
        title: "Small Business Administration – Local Resources",
        description: "Federal resources for small business development and funding.",
        type: "Link",
      },
    ],
  },
];

const faqs = [
  {
    q: "What documents do I need to apply for a permit?",
    a: "Required documents vary by project type but typically include a site plan, project description, proof of ownership or authorization, and applicable fees. Our Permit Application Guide has a full checklist by project type.",
  },
  {
    q: "How long does permit review take?",
    a: "Standard review is 3–6 weeks. Projects in Equity Priority Zones may qualify for expedited review. Check your project status online or contact your assigned Navigator.",
  },
  {
    q: "Can I get help in my language?",
    a: "Yes. The Language Access Program provides interpretation and translation at no cost. Call our main line and request your language — a qualified interpreter will be connected within 24 hours.",
  },
  {
    q: "Are there fee waivers available?",
    a: "Qualifying small businesses and nonprofit organizations may be eligible for partial or full permit fee waivers. Apply through the Equitable Permitting Access program or ask your Navigator.",
  },
  {
    q: "What is an Equity Priority Zone?",
    a: "Equity Priority Zones are geographic areas identified as historically underserved based on income, race, and access-to-services data. Projects in these zones may receive additional support, fee reductions, and expedited processing.",
  },
  {
    q: "How do I appeal a permit denial?",
    a: "You have 15 calendar days to file an appeal after a denial. Our Appeals Guide walks through each step. You can also request a Navigator to assist with your appeal at no cost.",
  },
];

const hotlines = [
  { label: "General Information", number: "(555) 867-5309", icon: Phone },
  { label: "Language Access Line", number: "(555) 867-5310", icon: Globe },
  { label: "Equity Navigator Intake", number: "(555) 867-5311", icon: Phone },
];

export default function Resources() {
  const [search, setSearch] = useState("");

  const filteredResources = resources.map((cat) => ({
    ...cat,
    items: cat.items.filter(
      (item) =>
        search === "" ||
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase())
    ),
  }));

  const typeIcon: Record<string, string> = {
    PDF: "📄",
    Video: "🎥",
    Link: "🔗",
  };

  return (
    <div>
      {/* Header */}
      <section className="bg-muted/30 border-b py-16 lg:py-20">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl text-center">
          <Badge variant="secondary" className="mb-4">Resources</Badge>
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
            Resource Center
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed mb-8">
            Guides, tutorials, and links to help you navigate development services with confidence.
          </p>
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search resources..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Resource Cards */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 lg:px-8 space-y-14">
          {filteredResources.map(({ category, icon: Icon, items }) =>
            items.length === 0 ? null : (
              <div key={category}>
                <div className="flex items-center gap-2 mb-6">
                  <Icon className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-bold">{category}</h2>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.map(({ title, description, type }) => (
                    <Card key={title} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-sm font-semibold leading-snug">
                            {title}
                          </CardTitle>
                          <span className="text-lg shrink-0">{typeIcon[type]}</span>
                        </div>
                        <CardDescription className="text-xs">{description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button variant="outline" size="sm" className="w-full text-xs gap-1">
                          <Download className="h-3 w-3" />
                          {type === "Link" ? "Open Link" : `Download ${type}`}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )
          )}
        </div>
      </section>

      {/* Hotlines */}
      <section className="bg-muted/20 border-y py-12">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
          <h2 className="text-2xl font-bold text-center mb-8">Need Help Now?</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {hotlines.map(({ label, number, icon: Icon }) => (
              <div
                key={label}
                className="flex flex-col items-center text-center p-5 rounded-xl border bg-card"
              >
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <p className="text-xs text-muted-foreground mb-1">{label}</p>
                <p className="font-semibold">{number}</p>
                <p className="text-xs text-muted-foreground mt-1">Mon–Fri, 8am–5pm</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 lg:px-8 max-w-2xl">
          <div className="text-center mb-10">
            <Badge variant="outline" className="mb-4">FAQ</Badge>
            <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>
          </div>
          <Accordion type="single" collapsible className="space-y-2">
            {faqs.map(({ q, a }, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="border rounded-lg px-4 bg-card"
              >
                <AccordionTrigger className="text-sm font-medium text-left">
                  {q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                  {a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </div>
  );
}
