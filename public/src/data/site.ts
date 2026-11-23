// Core site data: brand identity, nav, services overview, stats, process, values,
// group companies, awards and partners. Extracted from digisay.com.
import type {
  BrandInfo,
  GroupCompany,
  GroupCompanyLogo,
  CompanyValue,
  Award,
  Partner,
  TeamPhoto,
} from "@/types/site";
import type { HomeStat, ProcessStep } from "@/types/home";

export type {
  BrandInfo,
  GroupCompany,
  GroupCompanyLogo,
  CompanyValue,
  Award,
  Partner,
  TeamPhoto,
  HomeStat,
  ProcessStep,
};

export const brand: BrandInfo = {
  name: "DigiSay",
  legal: "DIGISAY LLC",
  logo: "/assets/brand/Digisay-logo-transparent-1-e1709464890607.png",
  logoBig: "/assets/brand/Digisay-logo-big.jpg",
  email: "info@digisay.com",
  phone: "+1 (809) 120-6705",
  hours: "Sunday – Thursday 9 am to 5 pm EET",
};

export const mainNav = [
  { label: "Home", to: "/" },
  { label: "Companies", to: "/about" },
  { label: "Services", to: "/services" },
  { label: "Influencers Marketing", to: "/influencers-marketing" },
  { label: "Resources", to: "/blog" },
  { label: "Privacy Policy", to: "/privacy-policy" },
  { label: "Let's Talk", to: "/contact" },
] as const;

export const serviceNav = [
  { label: "Anti-Piracy and Content Protection", to: "/anti-piracy" },
  { label: "Content Management and Monetization", to: "/content-management" },
  { label: "Digital Content Production", to: "/content-production" },
  { label: "Digital Services and Social Media Management", to: "/social-media" },
  { label: "Growth Marketing", to: "/growth-marketing" },
] as const;

export const homeServices = [
  {
    title: "Media Production",
    body: "Crafting captivating visual narratives for powerful brand storytelling",
    to: "/content-production",
  },
  {
    title: "Anti-Piracy",
    body: "Safeguarding digital content, securing creators' intellectual property",
    to: "/anti-piracy",
  },
  {
    title: "Social Media Management",
    body: "Elevating brands through strategic, engaging social media strategies",
    to: "/social-media",
  },
  {
    title: "Marketing Communications",
    body: "Strategic and impactful communication that resonates with target audiences",
    to: "/growth-marketing",
  },
  {
    title: "Content Management & Distribution",
    body: "Optimizing content journeys from creation to global distribution",
    to: "/content-management",
  },
  {
    title: "Growth Marketing",
    body: "Strategic performance marketing tactics that propel brands to new heights",
    to: "/growth-marketing",
  },
  {
    title: "Influencers Marketing",
    body: "Amplifying reach through authentic partnerships with influential figures",
    to: "/social-media",
  },
] as const;

export const homeStats = [
  {
    value: 165,
    suffix: "+",
    label: "Team Members",
    body: "A diverse team in the MENA region. Experts from different backgrounds working together to bring you dynamic and effective solutions.",
  },
  {
    value: 350,
    suffix: "+",
    label: "Successful Projects",
    body: "Our delivery showcases our commitment, expertise, and a proven track record for delivering success consistently.",
  },
  {
    value: 500,
    suffix: "+",
    label: "Satisfied Customers",
    body: "Our track record speaks volumes about our commitment, reliability, and client satisfaction.",
  },
  {
    value: 1000,
    suffix: "+",
    label: "Content Partners",
    body: "Success stories of our content collaborations reflect our commitment to delivering value and fostering strong relationships.",
  },
] as const;

export const processSteps = [
  {
    title: "Analyzing Your Current Process",
    body: "DigiSay analyzes strengths and weaknesses in the current process and examines data to identify areas for improvement. We use tools to gain insights into current activities and engage with your team to understand challenges.",
  },
  {
    title: "Setting Clear Objectives and Key Metrics",
    body: "Our methodology centers around setting SMART goals—Specific, Measurable, Achievable, Relevant, and Time-bound. By defining milestones and metrics that matter most to your brand, we create a roadmap that ensures every effort contributes meaningfully to your overarching success.",
  },
  {
    title: "Addressing Issues and Filling Gaps",
    body: "Our approach involves addressing issues and filling gaps in your current strategies. Through careful evaluation, we identify areas for improvement and implement strategic optimizations that maximize efficiency. The result is a streamlined and effective media strategy poised for success.",
  },
  {
    title: "Regularly Monitoring and Reporting on Goals",
    body: "Experience the power of transparency with our commitment to regularly tracking and reporting on goals. We understand that progress tracking is essential for informed decision-making. DigiSay provides comprehensive reports, ensuring you're not just kept in the loop but equipped with actionable insights to steer your brand towards continuous growth.",
  },
] as const;

export const values = [
  {
    title: "Multi-Platform",
    body: "We help build and shape a precise foundation to anchor the brand or project with a multi-platform approach in mind.",
  },
  {
    title: "Horizon Thinking",
    body: "As a result of working on different horizons strategically and building ecosystems around innovative brands, we enable change and empower business transformation.",
  },
  {
    title: "Ecosystem Building",
    body: "We bring and unify components together as well as bring different stakeholders to sustain industry progress and structure.",
  },
] as const;

export const groupCompanies = [
  {
    name: "CubitCode",
    body: "An innovative economy and venture building studio. Our experiences include media, tech, entrepreneurship, wellness, lifestyle, and ecosystem development.",
  },
  {
    name: "DigiSay Group",
    body: "A full-stack media company that started in 2010 focusing on creator services including content management and distribution.",
  },
  {
    name: "Immersive",
    body: "DigiSay Group's production arm, producing creative concepts developed in-house or in collaboration with other production partners.",
  },
  {
    name: "Mangos24",
    body: "A marketing communications agency that helps brands reach their target audiences through thoughtful plans utilizing online and offline channels.",
  },
  {
    name: "Revive",
    body: "A wellness media company focusing on reality shows, social content and technologies aiming at promoting a healthier lifestyle.",
  },
  {
    name: "RightsHero",
    body: "Innovative and adaptable solutions that enable copyright holders to protect their digital content from unauthorized copy and reuse on the internet.",
  },
  {
    name: "SilkBytes",
    body: "A dynamic, data-driven, and proactive tech company providing scalable solutions aimed at transforming the media industry.",
  },
] as const;

export const awards = [
  {
    title: "Outstanding Tech Implementation Award",
    year: "2023",
    by: "BroadcastPro Middle East",
    img: "/assets/awards/Outstanding_Tech_Implementation_of_2023-award_from_BroadcastPro_Middle_East-e1704240639702.png",
  },
  {
    title: "The Best Digital Asset Piracy Protection Solution Award",
    year: "2023",
    by: "UAE Business Awards",
    img: "/assets/awards/The_Best_Digital_Asset_Piracy_Protection_Solution_award_by_UAE_Business_Awards_in_2023-e1704240438568.png",
  },
] as const;

export const groupCompanyLogos = [
  { name: "CubitCode", src: "/assets/partners/cubitcode-logo.webp" },
  { name: "DigiSay Group", src: "/assets/brand/Digisay-logo-big.jpg" },
  { name: "Immersive", src: "/assets/partners/immersive-logo.webp" },
  { name: "Mangos24", src: "/assets/partners/Mangos24-logo-e1703376100960.webp" },
  { name: "Revive", src: "/assets/partners/reviveco-logo.webp" },
  { name: "RightsHero", src: "/assets/partners/RightsHero-logo-e1703375640984.webp" },
  { name: "SilkBytes", src: "/assets/partners/Silkbytes-logo.webp" },
] as const;

export const aboutPartners = [
  { name: "Al Arabya", src: "/assets/partners/AL-Arabya-01.png" },
  { name: "Al Ghad TV", src: "/assets/partners/AL-Ghad-tv-01.png" },
  { name: "Google", src: "/assets/partners/Googlr-01.png" },
  { name: "MBC", src: "/assets/partners/MBC-01-e1703983164691.png" },
  { name: "Netflix", src: "/assets/partners/Netflix-01-01.png" },
  { name: "ON", src: "/assets/partners/ON-01-01.png" },
  { name: "Roya", src: "/assets/partners/Ro_ya-01.png" },
  { name: "ROTANA", src: "/assets/partners/ROTANA-01.png" },
  { name: "Shahid", src: "/assets/partners/SHahid-01-01.png" },
  { name: "Sony", src: "/assets/partners/Sony-01-01.png" },
  { name: "STA", src: "/assets/partners/STA-01-01-1.png" },
  { name: "Synergy", src: "/assets/partners/Synergy-01.png" },
  { name: "Ten TV", src: "/assets/partners/Ten-Tv-01.png" },
  { name: "USAID", src: "/assets/partners/USAID-01.png" },
  { name: "Viu", src: "/assets/partners/Viu-01.png" },
  { name: "United", src: "/assets/partners/UNITED-01-01.png" },
  { name: "Bill and Melinda", src: "/assets/partners/Bill-and-Melinda-01.png" },
  { name: "GFF", src: "/assets/partners/GFF-01.png" },
  { name: "Hill International", src: "/assets/partners/Hill-International-01.png" },
  { name: "Magdi Yacoub", src: "/assets/partners/MAgdi-Yacoub-01-01.png" },
] as const;

export const partners = [
  { name: "Al Arabiya", src: "/assets/partners/AL-Arabya-01.png" },
  { name: "Al Ghad TV", src: "/assets/partners/AL-Ghad-tv-01.png" },
  { name: "Google", src: "/assets/partners/Googlr-01.png" },
  { name: "MBC", src: "/assets/partners/MBC-01-e1703983164691.png" },
  { name: "Netflix", src: "/assets/partners/Netflix-01-01.png" },
  { name: "ON", src: "/assets/partners/ON-01-01.png" },
  { name: "Roya", src: "/assets/partners/Ro_ya-01.png" },
  { name: "Rotana", src: "/assets/partners/ROTANA-01.png" },
  { name: "Shahid", src: "/assets/partners/SHahid-01-01.png" },
  { name: "Sony", src: "/assets/partners/Sony-01-01.png" },
  { name: "STA", src: "/assets/partners/STA-01-01-1.png" },
  { name: "Synergy", src: "/assets/partners/Synergy-01.png" },
  { name: "Ten TV", src: "/assets/partners/Ten-Tv-01.png" },
  { name: "USAID", src: "/assets/partners/USAID-01.png" },
  { name: "United", src: "/assets/partners/UNITED-01-01.png" },
  { name: "Viu", src: "/assets/partners/Viu-01.png" },
  { name: "Bill and Melinda", src: "/assets/partners/Bill-and-Melinda-01.png" },
  { name: "GFF", src: "/assets/partners/GFF-01.png" },
  { name: "Hill International", src: "/assets/partners/Hill-International-01.png" },
  { name: "Magdi Yacoub", src: "/assets/partners/MAgdi-Yacoub-01-01.png" },
] as const;

export const aboutTeamPhotos = [
  { src: "/assets/about/CubitCode-team-1-scaled-e1704735447854.jpeg" },
  { src: "/assets/about/CubitCode-team-2-scaled.jpeg" },
] as const;

export const offices = [
  {
    name: "UAE Office",
    lines: ["Office 10, Level 1,", "Sharjah Media City,", "Sharjah,", "United Arab Emirates"],
  },
  {
    name: "DigiSay U.S. Office",
    lines: ["Sunset Lake Road, Newark, New Castle,", "Delaware 19702,", "United States"],
  },
] as const;

export const contactServices = [
  "Anti-Piracy",
  "Content Management",
  "Content Production",
  "Growth Marketing",
  "Influencers Marketing",
  "Social Media Management",
] as const;

export const socialLinks = [
  { label: "Lk.", href: "https://www.linkedin.com/company/digisay/" },
  { label: "Tw.", href: "https://twitter.com/digisay" },
  { label: "Fb.", href: "https://facebook.com/DigiSay" },
  { label: "Ig.", href: "https://www.instagram.com/digisayltd" },
] as const;

export const careersHref = "https://digisay.breezy.hr/";

// Computed at call time (not module load) so long-running servers/SSR never
// show a stale year after New Year.
export const getCopyright = () => `© ${new Date().getFullYear()}, DigiSay`;
export const privacyPolicyTo = "/privacy-policy";
export const contactTo = "/contact";
