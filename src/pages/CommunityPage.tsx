import React, { useState } from "react";
import {
  Users,
  MapPin,
  Globe,
  Phone,
  Mail,
  Plus,
  Search,
  Filter,
  ExternalLink,
  ChevronRight,
  Heart,
  Calendar,
  MessageSquare
} from "lucide-react";
import { EditableText } from "@/components/EditableText";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

const communities = [
  {
    id: "1",
    name: "Black/African American Disability Community",
    type: "black_african_american",
    scope: "Statewide with metro focus",
    languages: ["English", "Somali", "Oromo", "Amharic"],
    population: "~42,000 Black Minnesotans with disabilities",
    keyOrgs: [
      "Ramsey County African American Leadership Forum",
      "Black Disability Collective MN",
      "NAACP Minnesota",
      "Urban League Twin Cities"
    ],
    accessScore: 4.2,
    languageScore: 6.8,
    providerDiversityScore: 3.5,
    priorities: ["Employment First disparities", "DSP workforce diversity", "Waiver access in North Minneapolis"],
    lastEngagement: "Feb 2025",
    engagementCount: 8,
    status: "active"
  },
  {
    id: "2",
    name: "American Indian/Alaska Native Disability Community",
    type: "indigenous_native_american",
    scope: "Statewide — metro and rural/reservation",
    languages: ["English", "Ojibwe", "Dakota"],
    population: "~12,000 Indigenous Minnesotans with disabilities",
    keyOrgs: [
      "Ain Dah Yung Center",
      "Upper Midwest American Indian Center",
      "Minnesota Indian Affairs Council",
      "Red Lake Nation Social Services"
    ],
    accessScore: 3.1,
    languageScore: 4.2,
    providerDiversityScore: 2.8,
    priorities: ["Rural/reservation service gaps", "Culturally safe providers", "Language preservation in services"],
    lastEngagement: "Jan 2025",
    engagementCount: 5,
    status: "active"
  },
  {
    id: "3",
    name: "Somali/East African Disability Community",
    type: "east_african",
    scope: "Twin Cities Metro (Minneapolis, Richfield, Brooklyn Park)",
    languages: ["Somali", "Oromo", "Amharic", "English"],
    population: "~18,000 East African Minnesotans with disabilities",
    keyOrgs: [
      "Brian Coyle Community Center",
      "Confederation of Somali Community in Minnesota",
      "African Immigrant Community Services",
      "Northside Achievement Zone"
    ],
    accessScore: 3.6,
    languageScore: 5.2,
    providerDiversityScore: 3.0,
    priorities: ["Somali DSP workforce", "Language access gaps (Oromo)", "Stigma reduction around disability"],
    lastEngagement: "Mar 2025",
    engagementCount: 12,
    status: "active"
  },
  {
    id: "4",
    name: "Hmong Disability Community",
    type: "asian_pacific_islander",
    scope: "Twin Cities and Central MN (St. Cloud)",
    languages: ["Hmong", "English"],
    population: "~9,500 Hmong Minnesotans with disabilities",
    keyOrgs: [
      "Hmong American Partnership",
      "Center for Hmong Arts and Talent",
      "Hmong Cultural Center",
      "St. Paul-Ramsey County Public Health"
    ],
    accessScore: 5.8,
    languageScore: 7.1,
    providerDiversityScore: 4.2,
    priorities: ["Hmong-speaking DSP shortage", "Rural Hmong communities in Central MN", "Elder care integration"],
    lastEngagement: "Feb 2025",
    engagementCount: 9,
    status: "active"
  },
  {
    id: "5",
    name: "Latinx/Hispanic Disability Community",
    type: "latinx_hispanic",
    scope: "Statewide — metro and Greater MN (Worthington, Marshall)",
    languages: ["Spanish", "English", "Indigenous languages (Mixtec, K'iche')"],
    population: "~22,000 Latinx Minnesotans with disabilities",
    keyOrgs: [
      "Council on Asian Pacific Minnesotans",
      "CLUES (Comunidades Latinas Unidas En Servicio)",
      "Centro Legal de la Raza",
      "Semilla Inc."
    ],
    accessScore: 5.1,
    languageScore: 7.8,
    providerDiversityScore: 4.0,
    priorities: ["Spanish-speaking provider network in Greater MN", "Immigration status barriers", "Agricultural worker families"],
    lastEngagement: "Mar 2025",
    engagementCount: 14,
    status: "active"
  },
  {
    id: "6",
    name: "Greater Minnesota Rural Disability Communities",
    type: "rural_greater_mn",
    scope: "Outstate MN — all 80 counties outside metro",
    languages: ["English", "Spanish (southern MN)"],
    population: "~68,000 rural Minnesotans with disabilities",
    keyOrgs: [
      "Minnesota Rural Partners",
      "Disability Hub MN Regional Offices",
      "Greater MN Family Service Centers",
      "CAP Agency Network"
    ],
    accessScore: 4.9,
    languageScore: 6.2,
    providerDiversityScore: 3.8,
    priorities: ["Provider network adequacy", "Transportation barriers", "Workforce shortages in rural counties"],
    lastEngagement: "Feb 2025",
    engagementCount: 7,
    status: "active"
  }
];

const engagementHistory = [
  { date: "Mar 15, 2025", community: "Somali/East African", type: "Listening Session", attendees: 47, themes: ["Language access", "Provider trust", "Employment barriers"] },
  { date: "Mar 10, 2025", community: "Latinx/Hispanic", type: "Advisory Panel", attendees: 12, themes: ["Immigration barriers", "CBSM navigation", "Greater MN gaps"] },
  { date: "Feb 28, 2025", community: "Black/African American", type: "Focus Group", attendees: 18, themes: ["Employment First", "North Minneapolis providers", "DSP wages"] },
  { date: "Feb 14, 2025", community: "Hmong Community", type: "Community Meeting", attendees: 35, themes: ["Elder disability services", "Hmong DSP pipeline", "Language services"] },
  { date: "Jan 25, 2025", community: "Indigenous Community", type: "Listening Session", attendees: 22, themes: ["Reservation gaps", "Cultural safety", "Tribal-state coordination"] },
  { date: "Jan 18, 2025", community: "Greater MN Rural", type: "Regional Forum", attendees: 64, themes: ["Transportation", "Provider shortage", "Telehealth gaps"] }
];

const typeColors: Record<string, string> = {
  black_african_american: "bg-[#003865]/10 text-[#003865]",
  indigenous_native_american: "bg-amber-100 text-amber-800",
  east_african: "bg-green-100 text-green-800",
  asian_pacific_islander: "bg-purple-100 text-purple-800",
  latinx_hispanic: "bg-orange-100 text-orange-800",
  rural_greater_mn: "bg-teal-100 text-teal-800"
};

function ScoreBar({ label, score }: { label: string; score: number }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className={`font-medium ${score < 5 ? "text-red-600" : score < 7 ? "text-amber-600" : "text-green-600"}`}>
          {score}/10
        </span>
      </div>
      <Progress
        value={score * 10}
        className={`h-1.5 ${score < 5 ? "[&>div]:bg-red-500" : score < 7 ? "[&>div]:bg-amber-500" : "[&>div]:bg-green-500"}`}
      />
    </div>
  );
}

export default function CommunityPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCommunity, setSelectedCommunity] = useState<typeof communities[0] | null>(null);

  const filtered = communities.filter(c =>
    !searchQuery ||
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.languages.some(l => l.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            <EditableText id="community.title" defaultValue="Community Partnerships" />
          </h1>
          <p className="text-muted-foreground mt-1">
            <EditableText id="community.subtitle" defaultValue={`${communities.length} community partnerships · Language justice · Nothing about us without us`} />
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Community
        </Button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-[#003865]">{communities.length}</div>
            <div className="text-sm text-muted-foreground">Community Partnerships</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-[#78BE21]">55</div>
            <div className="text-sm text-muted-foreground">Partner Organizations</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-[#003865]">9</div>
            <div className="text-sm text-muted-foreground">Languages Covered</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-[#003865]">55</div>
            <div className="text-sm text-muted-foreground">Engagements This Year</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="communities">
        <TabsList>
          <TabsTrigger value="communities">Communities</TabsTrigger>
          <TabsTrigger value="engagement">Engagement History</TabsTrigger>
        </TabsList>

        <TabsContent value="communities" className="mt-4 space-y-4">
          {/* Search */}
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search communities or languages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filtered.map(community => (
              <Card
                key={community.id}
                className={`cursor-pointer hover:shadow-md transition-shadow ${selectedCommunity?.id === community.id ? "ring-2 ring-[#003865]" : ""}`}
                onClick={() => setSelectedCommunity(community.id === selectedCommunity?.id ? null : community)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#003865]/10 flex items-center justify-center flex-shrink-0">
                        <Users className="h-5 w-5 text-[#003865]" />
                      </div>
                      <div>
                        <CardTitle className="text-sm leading-tight">{community.name}</CardTitle>
                        <div className="flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{community.scope}</span>
                        </div>
                      </div>
                    </div>
                    <Badge className={`text-xs border-0 ${typeColors[community.type] || "bg-gray-100 text-gray-700"}`}>
                      {community.engagementCount} engagements
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <p className="text-xs text-muted-foreground">{community.population}</p>

                  {/* Languages */}
                  <div className="flex flex-wrap gap-1">
                    {community.languages.map(lang => (
                      <span key={lang} className="text-xs bg-muted px-2 py-0.5 rounded flex items-center gap-1">
                        <Globe className="h-3 w-3" /> {lang}
                      </span>
                    ))}
                  </div>

                  {/* Equity scores */}
                  <div className="space-y-2">
                    <ScoreBar label="Service Access" score={community.accessScore} />
                    <ScoreBar label="Language Access" score={community.languageScore} />
                    <ScoreBar label="Provider Diversity" score={community.providerDiversityScore} />
                  </div>

                  {/* Priorities */}
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Equity Priorities</p>
                    <ul className="space-y-1">
                      {community.priorities.slice(0, 2).map((p, i) => (
                        <li key={i} className="text-xs text-foreground flex items-start gap-1.5">
                          <span className="text-[#78BE21] mt-0.5">•</span>
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      Last engaged: {community.lastEngagement}
                    </span>
                    <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                      View details <ChevronRight className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="engagement" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Community Engagement History</CardTitle>
              <CardDescription>Recent listening sessions, advisory panels, and community meetings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {engagementHistory.map((event, i) => (
                  <div key={i} className="flex gap-4 py-3 border-b last:border-0">
                    <div className="w-24 flex-shrink-0">
                      <p className="text-xs font-medium text-foreground">{event.date}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{event.attendees} attendees</p>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="text-sm font-medium">{event.community}</p>
                        <Badge className="bg-[#003865]/10 text-[#003865] border-0 text-xs">{event.type}</Badge>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {event.themes.map(theme => (
                          <span key={theme} className="text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground">
                            {theme}
                          </span>
                        ))}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 text-xs flex-shrink-0">
                      View
                    </Button>
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
