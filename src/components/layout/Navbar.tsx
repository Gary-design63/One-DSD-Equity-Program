import { useState } from "react";
import { NavLink } from "@/components/NavLink";
import { Button } from "@/components/ui/button";
import { Menu, X, Scale } from "lucide-react";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/programs", label: "Programs" },
  { to: "/resources", label: "Resources" },
  { to: "/contact", label: "Contact" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-8">
        <NavLink to="/" className="flex items-center gap-2 text-primary">
          <Scale className="h-6 w-6" />
          <span className="font-extrabold text-lg tracking-tight">One DSD</span>
          <span className="hidden sm:inline text-muted-foreground font-medium text-sm border-l pl-2 ml-1">
            Equity Program
          </span>
        </NavLink>

        <nav className="hidden md:flex items-center gap-6">
          {navItems.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              activeClassName="text-foreground font-semibold"
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:block">
          <Button asChild size="sm">
            <NavLink to="/contact">Apply Now</NavLink>
          </Button>
        </div>

        <button
          className="md:hidden p-2 rounded-md hover:bg-muted"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t bg-background px-4 py-4 flex flex-col gap-3">
          {navItems.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className="py-1 text-sm font-medium text-muted-foreground"
              activeClassName="text-foreground font-semibold"
              onClick={() => setOpen(false)}
            >
              {label}
            </NavLink>
          ))}
          <Button asChild size="sm" className="mt-2">
            <NavLink to="/contact" onClick={() => setOpen(false)}>
              Apply Now
            </NavLink>
          </Button>
        </div>
      )}
    </header>
  );
}
