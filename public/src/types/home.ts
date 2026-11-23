export interface HeroData {
  eyebrow: string;
  title: string;
  subtitle: string;
  cta: string;
  ctaTo: string;
  phoneLabel: string;
  phone: string;
  hours: string;
  emailLabel: string;
  emailTo: string;
}

export interface QuickContactData {
  title: string;
  phoneLabel: string;
  phone: string;
  hours: string;
  emailLabel: string;
  email: string;
  postAddressLabel: string;
  postAddress: string;
}

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
}

export interface HomeStat {
  value: number;
  suffix?: string;
  label: string;
  description?: string;
}

export interface ProcessStep {
  step: string;
  title: string;
  body: string;
}
