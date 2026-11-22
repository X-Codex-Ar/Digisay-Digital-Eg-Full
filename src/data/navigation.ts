export const mainNav = [
  { label: "Home", to: "/" },
  { label: "Companies", to: "/about" },
  { label: "Services", to: "/services" },
  { label: "Influencers Marketing", to: "/influencers-marketing" },
  { label: "Resources", to: "/blog" },
  { label: "Privacy Policy", to: "/privacy-policy" },
  { label: "Let's Talk", to: "/contact" },
] as const;

export const servicesMenu = [
  { label: "Anti-Piracy and Content Protection", to: "/anti-piracy" },
  { label: "Content Management and Monetization", to: "/content-management" },
  { label: "Digital Content Production", to: "/content-production" },
  { label: "Digital Services and Social Media Management", to: "/social-media" },
  { label: "Growth Marketing", to: "/growth-marketing" },
] as const;

export const resourcesMenu = [
  { label: "Blog", to: "/blog" },
] as const;

export const socialLinks = [
  { label: "Lk.", href: "https://www.linkedin.com/company/digisay/" },
  { label: "Tw.", href: "https://twitter.com/digisay" },
  { label: "Fb.", href: "https://facebook.com/DigiSay" },
  { label: "Ig.", href: "https://www.instagram.com/digisayltd" },
] as const;

export const headerCTAs = [
  { label: "Let's Talk", to: "/contact" },
  { label: "Free Consultation", to: "/contact" },
] as const;

export const footerTexts = {
  copyright: "© 2023, DigiSay",
} as const;
