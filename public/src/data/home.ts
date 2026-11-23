// Homepage data extracted from digisay.com.
import { brand } from "./site";
import type { HeroData, QuickContactData, Testimonial } from "@/types/home";

export type { HeroData, QuickContactData, Testimonial };

export const hero: HeroData = {
  eyebrow: "DigiSay Group",
  title: "The Digital Media Solutions Leader",
  subtitle:
    "DigiSay Group delivers comprehensive solutions that harness creativity, innovation, and strategy at every step of the customer journey, from concept to revenue generation",
  cta: "Let's Talk",
  ctaTo: "/contact",
  phoneLabel: "Work and general inquiries",
  phone: brand.phone,
  hours: "Assistance hours: Sunday – Thursday 9 am to 5 pm EET",
  emailLabel: "info@digisay.com",
  emailTo: "/contact",
};

export const quickContact: QuickContactData = {
  title: "Get in touch",
  phoneLabel: "Work and general inquiries",
  phone: brand.phone,
  hours: "Assistance hours: Sunday – Thursday 9 am to 5 pm EET",
  emailLabel: "Email",
  email: brand.email,
  postAddressLabel: "Post address",
  postAddress: "Office 10, Level 1, Sharjah Media City, Sharjah, UAE",
};

export const testimonials: Testimonial[] = [
  {
    quote:
      "It's totally customizable with the theme settings, it's compatible with a wide range of important plugins and the support is outstanding.",
    name: "Colin Lucido",
    role: "Co-founder, Colabrio",
  },
  {
    quote:
      "5 stars design agency! If anyone wants an example of what you can do with this theme, check out my site at ohio.clbthemes.com.",
    name: "Stacey Rickson",
    role: "Project Manager, Colabrio",
  },
  {
    quote:
      "I tell you what, there has never been an issue that Cory from the Colabrio Support Team hasn't been able to solve for me.",
    name: "Laura Morton",
    role: "UI/UX Designer, Colabrio",
  },
];

export const marqueeServices: string[] = [
  "Anti-Piracy & Content Protection",
  "Content Monetization",
  "Digital Content Production",
  "Social Media Strategy",
  "Growth & Performance Marketing",
  "Influencers Marketing",
  "RightsHero Protection",
  "Full-Stack Media Solutions",
];

export const latestBlogs = [
  {
    title: "Why Growth Marketing is Essential for your Business Success",
    to: "/blog/why-growth-marketing-is-essential-for-your-business-success/",
    category: "growth-marketing",
  },
  {
    title: "How Anti-Piracy Practices Unlock Revenue for Content Creators",
    to: "/blog/how-anti-piracy-practices-unlock-revenue-for-content-creators/",
    category: "anti-piracy",
  },
  {
    title:
      "Mastering Digital Success: The Comprehensive Advantage of Partnering with a Full-Fledged Digital Agency",
    to: "/blog/full-fledge-agency/",
    category: "digital-solutions",
  },
] as const;
