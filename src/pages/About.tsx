import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ArrowRight, Target, Eye, Milestone } from "lucide-react";

const timeline = [
  {
    year: "2018",
    title: "Program Founded",
    description:
      "One DSD Equity Program launched in response to community feedback identifying disparities in permit processing times across neighborhoods.",
  },
  {
    year: "2020",
    title: "Language Access Expansion",
    description:
      "Services expanded to offer full support in 8 languages, dramatically increasing reach within non-English-speaking communities.",
  },
  {
    year: "2022",
    title: "Navigator Program Launch",
    description:
      "Introduced dedicated Equity Navigators — trained advocates embedded in the department to guide underrepresented applicants.",
  },
  {
    year: "2024",
    title: "Digital Equity Initiative",
    description:
      "Launched online tools and community kiosks to bridge the digital divide and ensure equal access to online services.",
  },
];

const team = [
  { name: "Dr. Maria Gonzalez", title: "Program Director", initials: "MG" },
  { name: "James Okafor", title: "Community Outreach Lead", initials: "JO" },
  { name: "Priya Nair", title: "Equity Policy Analyst", initials: "PN" },
  { name: "David Chen", title: "Navigator Program Manager", initials: "DC" },
];

const values = [
  {
    question: "How does the program define equity?",
    answer:
      "Equity means ensuring every person receives the resources and support they need to achieve fair outcomes — not simply treating everyone the same. We acknowledge historical and structural disparities and work to actively correct them.",
  },
  {
    question: "Who does the One DSD Equity Program serve?",
    answer:
      "We serve all residents and businesses within our jurisdiction, with a focus on historically underserved communities including low-income households, minority-owned businesses, and non-English-speaking applicants.",
  },
  {
    question: "How is the program funded?",
    answer:
      "The program is funded through a combination of city general funds, state equity grants, and federal Community Development Block Grant (CDBG) allocations, ensuring stable, long-term service delivery.",
  },
  {
    question: "How can I get involved or provide feedback?",
    answer:
      "We hold quarterly community input sessions and maintain an open feedback portal year-round. Visit our Contact page to connect with the program team or attend an upcoming event.",
  },
];

export default function About() {
  return (
    <div>
      {/* Page Header */}
      <section className="bg-muted/30 border-b py-16 lg:py-20">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl text-center">
          <Badge variant="secondary" className="mb-4">About the Program</Badge>
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
            Who We Are
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            The One DSD Equity Program is a dedicated initiative within the Development Services
            Department committed to dismantling systemic barriers and ensuring every community
            member receives fair, accessible, and high-quality services.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="border-primary/20">
              <CardHeader>
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <CardTitle>Our Mission</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground leading-relaxed">
                To proactively identify and remove barriers within development services so that
                every resident, business owner, and community group can fully access and benefit
                from the services they are entitled to — equitably and without exception.
              </CardContent>
            </Card>
            <Card className="border-primary/20">
              <CardHeader>
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                  <Eye className="h-5 w-5 text-primary" />
                </div>
                <CardTitle>Our Vision</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground leading-relaxed">
                A Development Services Department where outcomes are not predicted by race, income,
                language, or geography — a department that is a model of equitable public service
                for the region and the nation.
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="bg-muted/20 py-16 lg:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">History</Badge>
            <h2 className="text-3xl font-bold flex items-center justify-center gap-2">
              <Milestone className="h-7 w-7 text-primary" /> Our Journey
            </h2>
          </div>
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute left-8 top-0 bottom-0 w-px bg-border hidden sm:block" />
            <div className="space-y-8">
              {timeline.map(({ year, title, description }) => (
                <div key={year} className="sm:pl-20 relative">
                  <div className="hidden sm:flex absolute left-0 h-16 w-16 rounded-full bg-primary text-primary-foreground items-center justify-center font-bold text-sm">
                    {year}
                  </div>
                  <div className="bg-card border rounded-xl p-5">
                    <p className="sm:hidden text-xs font-semibold text-primary mb-1">{year}</p>
                    <h3 className="font-semibold mb-1">{title}</h3>
                    <p className="text-sm text-muted-foreground">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">Leadership</Badge>
            <h2 className="text-3xl font-bold">Meet the Team</h2>
            <p className="text-muted-foreground mt-2">
              Dedicated public servants driving equity every day.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {team.map(({ name, title, initials }) => (
              <div
                key={name}
                className="text-center p-6 rounded-xl border bg-card hover:shadow-sm transition-shadow"
              >
                <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl mb-4">
                  {initials}
                </div>
                <h3 className="font-semibold">{name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-muted/20 py-16 lg:py-24">
        <div className="container mx-auto px-4 lg:px-8 max-w-2xl">
          <div className="text-center mb-10">
            <Badge variant="outline" className="mb-4">FAQ</Badge>
            <h2 className="text-3xl font-bold">Common Questions</h2>
          </div>
          <Accordion type="single" collapsible className="space-y-2">
            {values.map(({ question, answer }, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border rounded-lg px-4 bg-card">
                <AccordionTrigger className="text-sm font-medium text-left">
                  {question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                  {answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h2 className="text-2xl font-bold mb-3">Want to know more?</h2>
          <p className="text-muted-foreground mb-6">
            Explore our programs or reach out to speak with a team member directly.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild>
              <Link to="/programs">
                Our Programs <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
