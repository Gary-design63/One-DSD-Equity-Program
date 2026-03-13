import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { User } from "@shared/schema";

const roleColors: Record<string, string> = {
  Admin: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
  Reviewer: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  Viewer: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
};

export default function Admin() {
  const { data: users = [], isLoading } = useQuery<User[]>({ queryKey: ["/api/users"] });
  const [tab, setTab] = useState("general");

  return (
    <div className="p-6 max-w-[1000px] mx-auto">
      <div className="mb-6">
        <h2 className="text-base font-semibold text-foreground">Administration</h2>
        <p className="text-sm text-muted-foreground mt-1">Manage program settings, users, and integrations.</p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="general" data-testid="tab-admin-general">General</TabsTrigger>
          <TabsTrigger value="users" data-testid="tab-admin-users">Users</TabsTrigger>
          <TabsTrigger value="integrations" data-testid="tab-admin-integrations">Integrations</TabsTrigger>
          <TabsTrigger value="system" data-testid="tab-admin-system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Program Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="program-name">Program Name</Label>
                <Input id="program-name" defaultValue="One DSD Equity Program" data-testid="input-program-name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="division">Division</Label>
                <Input id="division" defaultValue="Disability Services Division" data-testid="input-admin-division" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fy">Fiscal Year</Label>
                <Input id="fy" defaultValue="FY2026" data-testid="input-fiscal-year" />
              </div>
              <Button size="sm" data-testid="button-save-settings">Save Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-4">Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Loading...</TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.id} data-testid={`user-row-${user.id}`}>
                        <TableCell className="pl-4 font-medium text-sm">{user.name}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{user.email}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${roleColors[user.role] || "bg-muted text-muted-foreground"}`}>
                            {user.role}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={user.status === "Active" ? "default" : "secondary"}
                            className="text-[11px]"
                          >
                            {user.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations">
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground text-sm">
              No integrations configured. Contact your administrator to set up external service connections.
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">System Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Version</span>
                <span className="font-medium tabular-nums">1.0.0</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Environment</span>
                <span className="font-medium">Development</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Database</span>
                <span className="font-medium">In-Memory</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Last Deploy</span>
                <span className="font-medium tabular-nums">March 12, 2026</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
