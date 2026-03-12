import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { MapPin, Phone, Clock, Mail, CheckCircle2 } from "lucide-react";
import { useState } from "react";

const schema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Enter a valid email address"),
  phone: z.string().optional(),
  program: z.string().min(1, "Please select a program of interest"),
  message: z.string().min(10, "Please provide at least 10 characters"),
});

type FormValues = z.infer<typeof schema>;

const programOptions = [
  "Equitable Permitting Access",
  "Equity Navigator Program",
  "Community Education Initiative",
  "Language Access Program",
  "Small Contractor Equity Initiative",
  "Historic Preservation Equity Fund",
  "General Inquiry",
];

const officeInfo = [
  {
    icon: MapPin,
    label: "Main Office",
    value: "1222 First Avenue, Suite 400\nSan Diego, CA 92101",
  },
  { icon: Phone, label: "Phone", value: "(555) 867-5309" },
  { icon: Mail, label: "Email", value: "equity@dsd.example.gov" },
  { icon: Clock, label: "Hours", value: "Monday–Friday\n8:00 AM – 5:00 PM" },
];

export default function Contact() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      program: "",
      message: "",
    },
  });

  function onSubmit(data: FormValues) {
    console.log("Form submitted:", data);
    setSubmitted(true);
    toast({
      title: "Application Received",
      description: "A team member will contact you within 2 business days.",
    });
  }

  return (
    <div>
      {/* Header */}
      <section className="bg-muted/30 border-b py-16 lg:py-20">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl text-center">
          <Badge variant="secondary" className="mb-4">Get in Touch</Badge>
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
            Apply or Contact Us
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Fill out the form below to apply for a program, request an Equity Navigator, or ask a
            question. We respond within 2 business days.
          </p>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-10 max-w-5xl mx-auto">
            {/* Office Info */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold mb-6">Contact Information</h2>
              {officeInfo.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex gap-3">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">{label}</p>
                    <p className="text-sm whitespace-pre-line">{value}</p>
                  </div>
                </div>
              ))}

              <div className="mt-8 p-4 rounded-xl bg-primary/5 border border-primary/20">
                <p className="text-sm font-medium mb-1">Need immediate help?</p>
                <p className="text-xs text-muted-foreground">
                  Call our Equity Navigator Intake Line at{" "}
                  <span className="font-semibold text-foreground">(555) 867-5311</span> to speak
                  with someone right away.
                </p>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-2">
              {submitted ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <CheckCircle2 className="h-14 w-14 text-green-500 mx-auto mb-4" />
                    <CardTitle className="text-2xl mb-2">Thank You!</CardTitle>
                    <CardDescription className="text-base">
                      Your inquiry has been submitted. A member of our team will reach out within
                      2 business days. If your need is urgent, please call{" "}
                      <strong>(555) 867-5309</strong>.
                    </CardDescription>
                    <Button
                      variant="outline"
                      className="mt-6"
                      onClick={() => {
                        setSubmitted(false);
                        form.reset();
                      }}
                    >
                      Submit Another Inquiry
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Program Inquiry / Application</CardTitle>
                    <CardDescription>
                      All fields marked are required. Your information is kept confidential.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                        <div className="grid sm:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="firstName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>First Name *</FormLabel>
                                <FormControl>
                                  <Input placeholder="Jane" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="lastName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Last Name *</FormLabel>
                                <FormControl>
                                  <Input placeholder="Smith" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email Address *</FormLabel>
                                <FormControl>
                                  <Input
                                    type="email"
                                    placeholder="jane@example.com"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Phone (optional)</FormLabel>
                                <FormControl>
                                  <Input
                                    type="tel"
                                    placeholder="(555) 000-0000"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="program"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Program of Interest *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a program..." />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {programOptions.map((opt) => (
                                    <SelectItem key={opt} value={opt}>
                                      {opt}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="message"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>How Can We Help? *</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Briefly describe your situation or what you need assistance with..."
                                  className="min-h-[110px]"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button type="submit" className="w-full" size="lg">
                          Submit Inquiry
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
