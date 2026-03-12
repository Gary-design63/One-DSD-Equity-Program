import { NavLink } from "@/components/NavLink";
import { Scale } from "lucide-react";

const links = {
  Program: [
    { to: "/about", label: "About Us" },
    { to: "/programs", label: "Our Programs" },
    { to: "/resources", label: "Resources" },
  ],
  "Get Involved": [
    { to: "/contact", label: "Apply Now" },
    { to: "/contact", label: "Volunteer" },
    { to: "/contact", label: "Partner With Us" },
  ],
  Support: [
    { to: "/resources", label: "FAQ" },
    { to: "/contact", label: "Contact Us" },
    { to: "/resources", label: "Downloads" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t bg-muted/40 mt-auto">
      <div className="container mx-auto px-4 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 text-primary mb-3">
              <Scale className="h-5 w-5" />
              <span className="font-extrabold text-base">One DSD</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Committed to building equitable access to development services for
              every community we serve.
            </p>
          </div>

          {Object.entries(links).map(([section, items]) => (
            <div key={section}>
              <h4 className="font-semibold text-sm mb-3">{section}</h4>
              <ul className="space-y-2">
                {items.map(({ to, label }) => (
                  <li key={label}>
                    <NavLink
                      to={to}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} One DSD Equity Program. All rights reserved.</p>
          <p>Building equity, one service at a time.</p>
        </div>
      </div>
    </footer>
  );
}
