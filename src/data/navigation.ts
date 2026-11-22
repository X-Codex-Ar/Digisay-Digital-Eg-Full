import type { NavItem, SocialLink, HeaderCTA } from "@/types/navigation";

export type { NavItem, SocialLink, HeaderCTA };

export const mainNav: readonly NavItem[] = [
  { label: "Home", to: "/" },
  { label: "Companies", to: "/about" },
  { label: "Services", to: "/services" },
  { label: "Influencers Marketing", to: "/influencers-marketing" },
  { label: "Resources", to: "/blog" },
  { label: "Privacy Policy", to: "/privacy-policy" },
  { label: "Let's Talk", to: "/contact" },
] as const;

export const servicesMenu: readonly NavItem[] = [
  { label: "Anti-Piracy and Content Protection", to: "/anti-piracy" },
  { label: "Content Management and Monetization", to: "/content-management" },
  { label: "Digital Content Production", to: "/content-production" },
  { label: "Digital Services and Social Media Management", to: "/social-media" },
  { label: "Growth Marketing", to: "/growth-marketing" },
] as const;

export const resourcesMenu: readonly NavItem[] = [{ label: "Blog", to: "/blog" }] as const;

export const socialLinks: readonly SocialLink[] = [
  { label: "Lk.", href: "https://www.linkedin.com/company/digisay/" },
  { label: "Tw.", href: "https://twitter.com/digisay" },
  { label: "Fb.", href: "https://facebook.com/DigiSay" },
  { label: "Ig.", href: "https://www.instagram.com/digisayltd" },
] as const;

export const headerCTAs: readonly HeaderCTA[] = [
  { label: "Let's Talk", to: "/contact" },
  { label: "Free Consultation", to: "/contact" },
] as const;

export const footerTexts = {
  getCopyright: () => `© ${new Date().getFullYear()}, DigiSay`,
} as const;
