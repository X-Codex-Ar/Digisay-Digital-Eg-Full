import { Link } from "@tanstack/react-router";

import { brand, copyright, offices, serviceNav, socialLinks } from "@/data/site";
import { PrimaryButton } from "@/components/common/PrimaryButton";
import { Container } from "@/components/common/Container";

function SocialIconLink({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a href={href} aria-label={label} className="text-muted-foreground transition-colors hover:text-foreground">
      {children}
    </a>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-background">
      <Container className="py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4 lg:grid-cols-5">
          <div className="flex flex-col gap-4 md:col-span-1">
            <Link to="/" aria-label="DigiSay">
              <img src={brand.logo} alt={brand.name} className="h-9 w-auto" loading="lazy" />
            </Link>
            <p className="text-sm text-muted-foreground">
              DigiSay Group — The Digital Media Solutions Leader. Building creator-economy services across MENA.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((s) => (
                <SocialIconLink key={s.label} href={s.href} label={s.label}>
                  <span className="text-xs font-semibold tracking-wide">{s.label}</span>
                </SocialIconLink>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-foreground">Services</h4>
            <ul className="flex flex-col gap-2">
              {serviceNav.map((s) => (
                <li key={s.label}>
                  <Link
                    to={s.to as never}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-foreground">Resources</h4>
            <ul className="flex flex-col gap-2">
              <li>
                <Link to="/blog" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-foreground">Offices</h4>
            {offices.map((o) => (
              <p key={o.name} className="mb-1 text-sm text-muted-foreground">
                <strong>{o.name}:</strong> {o.lines.join(" ")}
              </p>
            ))}
            <p className="mt-2 text-sm font-medium text-foreground">Work and general inquiries</p>
            <p className="text-sm text-muted-foreground">{brand.phone}</p>
            <PrimaryButton to="/contact" size="sm" className="mt-4">
              Let's Talk
            </PrimaryButton>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-sm text-muted-foreground">{copyright}</p>
          <Link to="/privacy-policy" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Privacy Policy
          </Link>
        </div>
      </Container>
    </footer>
  );
}
