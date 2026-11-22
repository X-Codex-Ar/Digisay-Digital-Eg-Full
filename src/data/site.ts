import logo from "@/assets/brand/logo.png.asset.json";
import alArabiya from "@/assets/partners/al-arabya-01.png.asset.json";
import alGhad from "@/assets/partners/al-ghad-tv-01.png.asset.json";
import google from "@/assets/partners/googlr-01.png.asset.json";
import netflix from "@/assets/partners/netflix-01-01.png.asset.json";
import on from "@/assets/partners/on-01-01.png.asset.json";
import roya from "@/assets/partners/ro_ya-01.png.asset.json";
import rotana from "@/assets/partners/rotana-01.png.asset.json";
import shahid from "@/assets/partners/shahid-01-01.png.asset.json";
import sony from "@/assets/partners/sony-01-01.png.asset.json";
import synergy from "@/assets/partners/synergy-01.png.asset.json";
import tenTv from "@/assets/partners/ten-tv-01.png.asset.json";
import usaid from "@/assets/partners/usaid-01.png.asset.json";
import viu from "@/assets/partners/viu-01.png.asset.json";

export const brand = { name: "DigiSay", legal: "DIGISAY LLC", logo: logo.url, email: "info@digisay.com" };

export const mainNav = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Services", to: "/services" },
  { label: "Contact", to: "/contact" },
] as const;

export const serviceNav = [
  { label: "Anti-Piracy", to: "/anti-piracy" },
  { label: "Content Production", to: "/content-production" },
  { label: "Content Management", to: "/content-management" },
  { label: "Social Media", to: "/social-media" },
  { label: "Growth Marketing", to: "/growth-marketing" },
] as const;

export const homeServices = [
  { title: "Media Production", body: "Crafting captivating visual narratives for powerful brand storytelling", to: "/content-production" },
  { title: "Anti-Piracy", body: "Safeguarding digital content, securing creators' intellectual property", to: "/anti-piracy" },
  { title: "Social Media Management", body: "Elevating brands through strategic, engaging social media strategies", to: "/social-media" },
  { title: "Marketing Communications", body: "Strategic and impactful communication that resonates with target audiences", to: "/growth-marketing" },
  { title: "Content Management & Distribution", body: "Optimizing content journeys from creation to global distribution", to: "/content-management" },
  { title: "Growth Marketing", body: "Strategic performance marketing tactics that propel brands to new heights", to: "/growth-marketing" },
  { title: "Influencers Marketing", body: "Amplifying reach through authentic partnerships with influential figures", to: "/social-media" },
] as const;

export const homeStats = [
  { value: 165, suffix: "+", label: "Team Members", body: "A diverse team in the MENA region. Experts from different backgrounds working together to bring you dynamic and effective solutions." },
  { value: 350, suffix: "+", label: "Successful Projects", body: "Our delivery showcases our commitment, expertise, and a proven track record for delivering success consistently." },
  { value: 500, suffix: "+", label: "Satisfied Customers", body: "Our track record speaks volumes about our commitment, reliability, and client satisfaction." },
  { value: 1000, suffix: "+", label: "Content Partners", body: "Success stories of our content collaborations reflect our commitment to delivering value and fostering strong relationships." },
];

export const processSteps = [
  { title: "Analyzing Your Current Process", body: "DigiSay analyzes strengths and weaknesses in the current process and examines data to identify areas for improvement. We use tools to gain insights into current activities and engage with your team to understand challenges." },
  { title: "Setting Clear Objectives and Key Metrics", body: "Our methodology centers around setting SMART goals—Specific, Measurable, Achievable, Relevant, and Time-bound. By defining milestones and metrics that matter most to your brand, we create a roadmap that ensures every effort contributes meaningfully to your success." },
  { title: "Addressing Issues and Filling Gaps", body: "Through careful evaluation, we identify areas for improvement and implement strategic optimizations that maximize efficiency. The result is a streamlined and effective media strategy poised for success." },
  { title: "Regularly Monitoring and Reporting on Goals", body: "We understand that progress tracking is essential for informed decision-making. DigiSay provides comprehensive reports, ensuring you're equipped with actionable insights to steer your brand towards continuous growth." },
];

export const values = [
  { title: "Multi-Platform", body: "We help build and shape a precise foundation to anchor the brand or project with a multi-platform approach in mind." },
  { title: "Horizon Thinking", body: "As a result of working on different horizons strategically and building ecosystems around innovative brands, we enable change and empower business transformation." },
  { title: "Ecosystem Building", body: "We bring and unify components together as well as bring different stakeholders to sustain industry progress and structure." },
];

export const groupCompanies = [
  { name: "Cubitcode", body: "An innovative economy and venture building studio. Our experiences include media, tech, entrepreneurship, wellness, lifestyle, and ecosystem development." },
  { name: "DigiSay Group", body: "A full-stack media company that started in 2010 focusing on creator services including content management and distribution." },
  { name: "Immersive", body: "DigiSay Group's production arm, producing creative concepts developed in-house or in collaboration with other production partners." },
  { name: "Mangos24", body: "A marketing communications agency that helps brands reach their target audiences through thoughtful plans utilizing online and offline channels." },
  { name: "Revive", body: "A wellness media company focusing on reality shows, social content and technologies aiming at promoting a healthier lifestyle." },
  { name: "RightsHero", body: "Innovative and adaptable solutions that enable copyright holders to protect their digital content from unauthorized copy and reuse on the internet." },
  { name: "SilkBytes", body: "A dynamic, data-driven, and proactive tech company providing scalable solutions aimed at transforming the media industry." },
];

export const awards = [
  { title: "Outstanding Tech Implementation Award", year: "2023", by: "BroadcastPro Middle East" },
  { title: "The Best Digital Asset Piracy Protection Solution Award", year: "2023", by: "UAE Business Awards" },
];

export const partners = [
  { name: "Al Arabiya", src: alArabiya.url }, { name: "Al Ghad TV", src: alGhad.url }, { name: "Google", src: google.url },
  { name: "Netflix", src: netflix.url }, { name: "ON", src: on.url }, { name: "Roya", src: roya.url }, { name: "Rotana", src: rotana.url },
  { name: "Shahid", src: shahid.url }, { name: "Sony", src: sony.url }, { name: "Synergy", src: synergy.url },
  { name: "Ten TV", src: tenTv.url }, { name: "USAID", src: usaid.url }, { name: "Viu", src: viu.url },
];

export const offices = [
  { name: "UAE Office", lines: ["Office 10, Level 1,", "Sharjah Media City,", "Sharjah,", "United Arab Emirates"] },
  { name: "DigiSay U.S. Office", lines: ["Sunset Lake Road, Newark, New Castle,", "Delaware 19702,", "United States"] },
];

export const contactServices = ["Anti-Piracy", "Content Management", "Content Production", "Growth Marketing", "Influencers Marketing", "Social Media Management"] as const;
