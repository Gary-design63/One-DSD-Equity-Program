import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Home", path: "/" },
  { label: "About", path: "/about" },
  { label: "Resources", path: "/resources" },
  { label: "Programs", path: "/programs" },
  { label: "Get Involved", path: "/get-involved" },
  { label: "Contact", path: "/contact" },
];

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-primary">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
            1
          </div>
          <span className="hidden sm:inline text-lg leading-tight">
            One DSD <span className="text-accent">Equity</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "px-3 py-2 text-sm font-medium rounded-md transition-colors hover:text-primary hover:bg-secondary",
                location.pathname === item.path
                  ? "text-primary bg-secondary"
                  : "text-foreground/70"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Button size="sm" asChild>
            <Link to="/get-involved">Take Action</Link>
          </Button>
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden p-2 rounded-md text-foreground/70 hover:text-foreground"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Nav */}
      {menuOpen && (
        <div className="md:hidden border-t bg-background px-4 pb-4 pt-2">
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  "px-3 py-2 text-sm font-medium rounded-md transition-colors hover:text-primary hover:bg-secondary",
                  location.pathname === item.path
                    ? "text-primary bg-secondary"
                    : "text-foreground/70"
                )}
              >
                {item.label}
              </Link>
            ))}
            <Button size="sm" className="mt-2" asChild>
              <Link to="/get-involved" onClick={() => setMenuOpen(false)}>
                Take Action
              </Link>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
