export type ServiceSlug =
  | "anti-piracy"
  | "content-production"
  | "content-management"
  | "social-media"
  | "growth-marketing"
  | "influencers-marketing";

export interface ServiceItem {
  title: string;
  lead?: string;
  body: string;
}

export interface ServiceGroup {
  eyebrow: string;
  heading: string;
  items: ServiceItem[];
}

export interface Feature {
  title: string;
  body: string;
}

export interface Stat {
  value: number;
  suffix?: string;
  label: string;
}

export interface ServiceSpotlight {
  eyebrow: string;
  heading: string;
  paragraphs: string[];
  features?: Feature[];
  list?: { heading: string; items: string[] };
}

export interface ServicePage {
  slug: ServiceSlug;
  name: string;
  summary: string;
  heroTitle: string;
  heroAccent: string;
  image: string;
  groups: ServiceGroup[];
  spotlight?: ServiceSpotlight;
  features?: { heading: string; items: Feature[] };
  stats?: { heading: string; items: Stat[] };
  partnerModels?: { heading: string; items: Feature[] };
}

export interface StackedServiceCardData {
  id: string;
  index: string;
  tag: string;
  title: string;
  description: string;
  highlights: string[];
  to: string;
  iconName: "ShieldCheck" | "Film" | "Radio" | "TrendingUp" | "Share2" | "Users";
}

export interface ServiceOfferingItem {
  title: string;
  description: string;
  metric: string;
  href: string;
  iconName: "Film" | "ShieldCheck" | "TrendingUp" | "Video" | "Users" | "Share2";
}

export interface OverviewMetric {
  value: string;
  label: string;
}
