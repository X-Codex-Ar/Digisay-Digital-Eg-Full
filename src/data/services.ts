import antiPiracyImg from "@/assets/services/anti-piracy.webp.asset.json";
import acquisitionImg from "@/assets/services/customer-acquisition.png.asset.json";
import agencyImg from "@/assets/services/one-stop-agency.jpg.asset.json";

import type {
  ServiceItem,
  ServiceGroup,
  Feature,
  Stat,
  ServicePage,
  ServiceSlug,
  StackedServiceCardData,
  ServiceOfferingItem,
  OverviewMetric,
} from "@/types/services";

export type {
  ServiceItem,
  ServiceGroup,
  Feature,
  Stat,
  ServicePage,
  ServiceSlug,
  StackedServiceCardData,
  ServiceOfferingItem,
  OverviewMetric,
};

export const servicePages: ServicePage[] = [
  {
    slug: "anti-piracy",
    name: "Anti-Piracy",
    summary: "Safeguarding digital content, securing creators' intellectual property",
    heroTitle: "Safeguard Your Digital Assets with DigiSay's Dynamic",
    heroAccent: "Anti-Piracy Solutions",
    image: antiPiracyImg.url,
    groups: [
      {
        eyebrow: "Anti-Piracy & Content Protection",
        heading: "Secure your Content & Empower your Brand. Connect with DigiSay!",
        items: [
          {
            title: "Content Monitoring & Detection",
            lead: "DigiSay employs cutting-edge monitoring software and human intelligence, proactively scanning the internet for unauthorized copies of your content.",
            body: "Benefit from viewership analytics, content acquisition analysis, torrent (P2P) insights, and customer journey mapping to stay one step ahead of piracy.",
          },
          {
            title: "Secure Your Online Presence",
            lead: "Extend your defense to social media channels and YouTube.",
            body: "DigiSay implements specialized measures to protect your content from unauthorized use, ensuring your creations remain secure and your brand's integrity intact across popular online platforms.",
          },
          {
            title: "Pirated Content Takedown & Removal",
            lead: "Upon identifying pirated content, DigiSay takes swift action to have it removed from the platform.",
            body: "Our efficient takedown and removal process ensures seamless protection for your digital assets, safeguarding your content and intellectual property.",
          },
          {
            title: "Prevent Revenue Loss with Content Protection",
            lead: "Safeguarding your content is the key to unlocking its full monetization potential.",
            body: "Protecting your digital assets through anti-piracy measures not only preserves their value and exclusivity but also maximizes revenue on digital channels and social media platforms.",
          },
        ],
      },
    ],
    spotlight: {
      eyebrow: "RightsHero",
      heading: "Fortify Your Content Against Piracy with RightsHero",
      paragraphs: [
        "Elevate your digital protection with RightsHero, the ultimate anti-piracy software.",
        "Our cutting-edge solution goes beyond safeguarding your content. It's a fortress against unauthorized use.",
        "Monitor real-time results, swiftly detect piracy sources, and enjoy the ease of tracking and removal.",
        "Experience seamless control and protection for your digital assets with our cutting-edge dashboard features.",
      ],
      features: [
        {
          title: "AI Powered Search Bot",
          body: "Scans websites with interconnected links, cyberlockers, applications, social media, streaming services, and peer-to-peer platforms.",
        },
        {
          title: "Real-time Insights",
          body: "Access real-time data by viewing comprehensive search results immediately after they are identified within the anti-piracy software.",
        },
        {
          title: "Automated Piracy Source Detection",
          body: "Advanced algorithms to identify and locate sources of unauthorized content distribution and piracy on the internet.",
        },
        {
          title: "Dashboards & Reports",
          body: "Leverage performance dashboards and personalized reports to swiftly grasp the extent of your anti-piracy coverage.",
        },
      ],
      list: {
        heading: "Content Protection & Anti-Piracy",
        items: [
          "Search Engines De-Listing",
          "Tubes & UGC Web Enforcement",
          "App Stores Protections",
          "Social Media & Telegram Content Protection",
          "Live Streaming Disruption",
          "Illegal Ads Takedown",
          "Illegal IPTV Devices & Apps Disruption",
          "Content Monitoring & Analytics",
        ],
      },
    },
  },
  {
    slug: "content-production",
    name: "Content Production",
    summary: "Crafting captivating visual narratives for powerful brand storytelling",
    heroTitle: "Elevate, Captivate, and Resonate with our Comprehensive Suite of",
    heroAccent: "Content Production Services",
    image: agencyImg.url,
    groups: [
      {
        eyebrow: "Content Production",
        heading: "Our Professional Content Production Services Crafted for your Brand's Success",
        items: [
          {
            title: "Concept Development and Storytelling",
            lead: "Stories brings your brand to life through expert concept development and storytelling.",
            body: "From ideation to execution, our creative experts transform your vision into compelling narratives, ensuring your digital content resonates with audiences, evokes emotion, and leaves a lasting impact.",
          },
          {
            title: "Expert Scriptwriting",
            lead: "Unlock the potential of your message with script mastery.",
            body: "Our skilled scriptwriters craft impactful scripts, while meticulous editing ensures your content is polished, enhancing audience engagement and brand communication.",
          },
          {
            title: "Professional Video Production",
            lead: "Create visually stunning content that captivates and communicates your brand story.",
            body: "From conceptualization to execution, we ensure your videos are a powerful tool for engagement, conversion, and brand advocacy.",
          },
          {
            title: "Audio Production",
            lead: "Our audio production services bring your content to life through carefully crafted soundscapes.",
            body: "Enhance the overall viewer experience and ensure your brand is remembered for its distinctive audio identity.",
          },
          {
            title: "Photography and Videography Excellence",
            lead: "Shutter Magic, our photography and videography service, immortalizes your brand's essence.",
            body: "From stunning visuals to cinematic storytelling, we freeze moments in time, creating a visual legacy that resonates with your audience.",
          },
          {
            title: "Content Localization",
            lead: "Gain a total content solution. From concept inception to localized adaptation, we are your end-to-end digital content partner.",
            body: "We ensure every piece we create reflects the essence of your brand, resonates with your audience, and drives success in the digital landscape.",
          },
        ],
      },
    ],
  },
  {
    slug: "content-management",
    name: "Content Management",
    summary: "Optimizing content journeys from creation to global distribution",
    heroTitle: "Empower Your Business to Elevate & Strategically",
    heroAccent: "Monetize Your Content",
    image: acquisitionImg.url,
    groups: [
      {
        eyebrow: "Content Management & Monetization",
        heading: "Maximize Audience Engagement & Unlock New Revenue Streams",
        items: [
          {
            title: "Comprehensive Content Strategy",
            lead: "DigiSay transforms your content into a strategic asset.",
            body: "From planning to execution, our content strategy ensures your brand narrative aligns seamlessly with your goals.",
          },
          {
            title: "Content Monetization",
            lead: "Maximize Earnings, Everywhere. DigiSay unlocks diverse revenue streams.",
            body: "From social media to streaming platforms, our multichannel approach amplifies your earning potential through strategic partnerships and affiliate marketing.",
          },
          {
            title: "Curated Content Acquisition",
            lead: "Access a curated selection of premium content for your platform.",
            body: "Enhance your offerings, captivate your audience, and create a diverse content library without the hassle of extensive searching.",
          },
          {
            title: "Content Management",
            lead: "DigiSay tailors your content for different digital channels.",
            body: "We navigate algorithms seamlessly for maximum visibility and audience engagement.",
          },
          {
            title: "Omni-Platform Content Distribution",
            lead: "DigiSay ensures your content's omnipresence.",
            body: "Seamlessly organize, schedule, and distribute your content across various platforms, ensuring a consistent and engaging experience for your audience.",
          },
          {
            title: "Immersive Streaming Experience",
            lead: "Take your content to new heights with captivating live streams.",
            body: "Deliver live streams on leading platforms, engage your audience, and amplify your brand presence. Experience streaming without boundaries.",
          },
          {
            title: "Affiliate Content Marketing",
            lead: "Leverage affiliate marketing and turn your creative passion into a lucrative business.",
            body: "Integrating affiliate marketing strategies to generate revenue through partnerships and commission-based collaborations.",
          },
        ],
      },
    ],
    spotlight: {
      eyebrow: "Data-Driven Decisions",
      heading: "Empowers Your Business to Make Informed Decisions",
      paragraphs: [
        "DigiSay empowers your strategy with actionable insights.",
        "Dive into comprehensive analytics and reporting, making informed decisions for sustained growth and success.",
      ],
    },
    stats: {
      heading: "Achievements by Numbers",
      items: [
        { value: 70, suffix: "B", label: "Views/Streams" },
        { value: 1000, suffix: "+", label: "Content Partners" },
        { value: 80, suffix: "+", label: "YouTube Awards" },
        { value: 35, suffix: "%", label: "CAGR Revenue" },
      ],
    },
  },
  {
    slug: "social-media",
    name: "Social Media",
    summary: "Elevating brands through strategic, engaging social media strategies",
    heroTitle: "Skyrocket Your Success & Elevate Your Brand with Proven",
    heroAccent: "Social Media Mastery!",
    image: agencyImg.url,
    groups: [
      {
        eyebrow: "Strategy & Digital Services",
        heading:
          "Elevate your Online Impact & Engage your Audience with our Tailored Strategies and Dynamic Digital Solutions.",
        items: [
          {
            title: "Social Media Strategy Development",
            lead: "Elevate your brand's digital presence with our expertly crafted social media strategies.",
            body: "We delve deep into your business goals, identifying target audiences and defining the perfect roadmap for optimal engagement, growth, and ROI.",
          },
          {
            title: "Social Media Audits",
            lead: "Discover the untapped potential of your social media presence through our comprehensive audits.",
            body: "We evaluate your current strategy, pinpointing areas for improvement and highlighting opportunities for growth.",
          },
          {
            title: "Social Listening and Monitoring",
            lead: "Stay ahead of the curve with our social listening and monitoring services.",
            body: "We employ cutting-edge tools to track brand mentions, analyze sentiment, and monitor industry trends.",
          },
          {
            title: "Paid Social Advertising",
            lead: "Turbocharge your brand's visibility through our paid social advertising services.",
            body: "We design and execute targeted campaigns, optimizing ad spend for maximum reach and conversions.",
          },
          {
            title: "Competitor Analysis",
            lead: "Our competitor analysis services are your secret weapon for staying ahead in the digital landscape.",
            body: "We meticulously study your rivals, decoding industry trends and benchmarks to refine your social media strategy.",
          },
          {
            title: "Chatbot Integration",
            lead: "Automate Engagement. Elevate your customer service with our chatbot integration services.",
            body: "Implement chatbots for real-time interaction, improving response times and enhancing user experience.",
          },
          {
            title: "Cross-Platform Content Repurposing",
            lead: "Tailor your content for success across various platforms with our cross-platform content repurposing services.",
            body: "Ensure consistency while catering to each platform's unique audience, maximizing the impact of your content.",
          },
          {
            title: "A/B Testing and Optimization",
            lead: "Refine and Succeed. Continuously improve your social media strategy with our A/B testing and optimization services.",
            body: "Conduct experiments, analyze performance results, and iteratively refine your approach for ongoing success.",
          },
        ],
      },
      {
        eyebrow: "Social Media Management",
        heading: "Discover Our Cutting-Edge Social Media Management Solutions",
        items: [
          {
            title: "Content Calendar Mastery",
            lead: "Stay top-of-mind with a meticulously planned content calendar.",
            body: "Our service guarantees a consistent stream of engaging posts, keeping your audience hooked and your brand in the spotlight.",
          },
          {
            title: "Community Building and Management",
            lead: "Foster a vibrant online community with our community building and management services.",
            body: "We actively engage with your audience, nurturing a loyal following and encouraging user-generated content.",
          },
          {
            title: "Analytics and Performance Reportings",
            lead: "Our service provides in-depth analytics, offering insights into audience demographics, post performance, and engagement trends.",
            body: "By leveraging this information, we empower you to make informed decisions, refine your strategy, and maximize your ROI.",
          },
          {
            title: "Real-Time Engagement & Interaction",
            lead: "Our social media management service prioritizes real-time engagement.",
            body: "We monitor your platforms around the clock, responding promptly to comments, messages, and mentions.",
          },
        ],
      },
    ],
    spotlight: {
      eyebrow: "Approach",
      heading: "We Craft Social Success",
      paragraphs: [
        "Our Approach Unleashes Tailored Strategies, Dynamic Content, and Precise Analytics to Elevate Your Brand's Impact!",
        "Dive into the World of Social Media Analytics – Your Tool for Understanding, Optimizing, and Thriving in the Digital Game.",
      ],
    },
  },
  {
    slug: "growth-marketing",
    name: "Growth Marketing",
    summary: "Strategic performance marketing tactics that propel brands to new heights",
    heroTitle: "Elevate Growth with Our Dynamic",
    heroAccent: "Growth Marketing Solutions",
    image: acquisitionImg.url,
    groups: [
      {
        eyebrow: "Inbound & CRM Marketing",
        heading: "Attract and Engage with Targeted Audience",
        items: [
          {
            title: "Search Engine & App Store Optimization (SEO/ASO)",
            lead: "Elevate your online visibility with our SEO/ASO expertise.",
            body: "We optimize your content for search engines and App stores ensuring your brand stands out and attracts organic traffic, maximizing your reach and impact.",
          },
          {
            title: "CRM Marketing & Lead Nurturing",
            lead: "Supercharge your customer relationships with our CRM marketing and lead nurturing strategies.",
            body: "We leverage powerful CRM tools to understand and engage your audience on a deeper level, creating personalized experiences that nurture leads and accelerate conversions.",
          },
          {
            title: "Content Marketing",
            lead: "Ignite engagement through compelling narratives.",
            body: "Our content marketing experts craft stories that resonate with your audience during each stage of the conversion funnel, turning passive visitors into active participants and advocates of your brand.",
          },
          {
            title: "Email Marketing & Automation Workflows",
            lead: "Transform your email campaigns into revenue generators.",
            body: "Our email marketing and automation strategies ensure each message resonates, nurtures leads, and ultimately converts, driving consistent profitability.",
          },
          {
            title: "Search Engine Marketing (SEM)",
            lead: "Ensure that your product or service is prominently displayed when users actively seek it.",
            body: "This targeted visibility captures users with a high intent to engage turning mere searches into meaningful interactions.",
          },
          {
            title: "Websites, Landing Pages, and Call-to-Action (CTAs)",
            lead: "DigiSay designs and optimizes websites and landing pages that seamlessly guide visitors through the conversion journey.",
            body: "Our team crafts irresistible calls to action (CTAs) that propel users to take immediate action.",
          },
        ],
      },
      {
        eyebrow: "Outbound Marketing",
        heading: "Push Messages to Your Audience to Generate Interest",
        items: [
          {
            title: "B2B Lead Prospecting",
            lead: "Discover a goldmine of potential customers with our lead prospecting tools.",
            body: "We employ cutting-edge technologies to identify and target your ideal audience, ensuring every outreach is a step closer to conversion.",
          },
          {
            title: "Cold Emails",
            lead: "Our cold email wizards turn ice-cold leads into warm prospects through a meticulous warm-up process.",
            body: "Our personalized, strategic, and effective emails initiate conversations that convert prospects into loyal customers.",
          },
          {
            title: "Google Ads",
            lead: "Soar to the top of search results with our Google Ads mastery.",
            body: "We strategically position your brand where it matters most, ensuring every click is a potential customer primed for conversion.",
          },
          {
            title: "Social Media Advertising",
            lead: "Command attention across social platforms with our social media advertising expertise.",
            body: "We craft compelling campaigns that resonate with your audience, drive engagement, and convert casual scrollers into active participants.",
          },
          {
            title: "Video Ads",
            lead: "Capture attention and drive engagement with our expertly crafted video ads.",
            body: "From storytelling to product showcases, our videos turn views into conversions, making every second count in your customer's journey.",
          },
          {
            title: "Creative Design",
            lead: "Ignite brand recognition and captivate your audience with our Creative Design for Digital Ads service.",
            body: "Our expert designers craft visually stunning creatives, ensuring your brand stands out in the digital noise.",
          },
        ],
      },
    ],
    features: {
      heading: "Data & Optimization",
      items: [
        {
          title: "Custom Event Tracking",
          body: "From button clicks to form submissions, tracking events provide invaluable data for refining UI, developing features, and improving key metrics like conversion rates.",
        },
        {
          title: "Customer Segmentation",
          body: "Strategically segment your audience to ensure increased engagement, higher conversion rates, and improved revenue and profitability.",
        },
        {
          title: "Marketing Automation",
          body: "Streamline processes, nurture leads, and engage with precision, allowing your team to focus on what truly matters – growth and innovation.",
        },
        {
          title: "A/B Testing",
          body: "We analyze performance metrics, refine strategies, and optimize campaigns to ensure ongoing success and growth.",
        },
        {
          title: "Advanced Analytics",
          body: "Our analytics and reporting services provide insights that guide your approach, ensuring each campaign is optimized for maximum impact and ROI.",
        },
      ],
    },
    partnerModels: {
      heading: "We Offer Different Ways to Partner With Us",
      items: [
        {
          title: "Dedicated Growth Team",
          body: "Elevate your growth trajectory with our dedicated Growth Marketing Team. From strategic planning to day-to-day performance marketing, we are your partners in driving success.",
        },
        {
          title: "CMO as a Service",
          body: "Experience visionary leadership. Empower your business with seasoned executives steering your marketing strategies. Gain the strategic edge without the overhead.",
        },
        {
          title: "Growth Marketing Consulting",
          body: "Navigate your growth challenges with our expert Growth Consultancy. Tailored advice and strategic insights for sustainable and scalable success.",
        },
      ],
    },
  },
  {
    slug: "influencers-marketing",
    name: "Influencers Marketing",
    summary: "Amplifying reach through authentic partnerships with influential figures",
    heroTitle:
      "We Connect Your Story with Authentic Creators to Drive Real Impact and Audience Engagement",
    heroAccent: "",
    image: "/assets/services/one-stop-agency.jpeg",
    groups: [
      {
        eyebrow: "Influencer Partnerships",
        heading: "Your Brand's Success Story Starts Here",
        items: [
          {
            title: "Influencer Partnerships",
            body: "Elevate your brand presence by forming impactful partnerships with influencers who resonate with your audience. Our expert curation ensures that every collaboration is not just a promotion but a genuine connection, enhancing brand loyalty.",
          },
          {
            title: "Audience-Centric Content Creation",
            body: "Engage and captivate your target audience with content that speaks directly to their interests. Our network of influencers specialize in creating authentic, compelling content that resonates with their followers, ensuring your brand message is delivered seamlessly.",
          },
          {
            title: "Strategic Campaign Design",
            body: "Crafting successful campaigns requires more than influencers; it needs strategic thinking. Our team designs campaigns that align with your brand goals, ensuring each collaboration is a step towards achieving your business objectives.",
          },
          {
            title: "Seamless Collaboration Management",
            body: "From negotiation to execution, we handle every aspect of influencer collaboration. Our streamlined process ensures seamless communication, timely deliverables, and a stress-free experience, allowing you to focus on your business while we handle the details.",
          },
          {
            title: "Amplified Social Media Presence",
            body: "Extend your brand's reach across social media platforms through strategic influencer partnerships. Benefit from the exposure of diverse audiences and witness the ripple effect as your brand gains visibility in previously untapped markets.",
          },
          {
            title: "Continuous Campaign Optimization",
            body: "Our commitment doesn't end with campaign launch. We continuously optimize based on real-time analytics, ensuring your brand stays ahead in the ever-evolving digital landscape.",
          },
        ],
      },
    ],
  },
];

export const getServicePage = (slug: ServicePage["slug"]) => {
  const page = servicePages.find((p) => p.slug === slug);
  if (!page) throw new Error(`Unknown service ${slug}`);
  return page;
};

// Centralized Stacked Deck Service Cards for Home Services Overview Section
export const stackedServicesData: StackedServiceCardData[] = [
  {
    id: "anti-piracy",
    index: "01",
    tag: "CONTENT PROTECTION",
    title: "Anti-Piracy & Rights Defense",
    description:
      "Enterprise-grade copyright defense powered by proprietary RightsHero technology. We detect, takedown, and protect original intellectual property across YouTube, social networks, IPTV, and global pirated streaming portals.",
    highlights: [
      "24/7 Real-Time Automated Crawlers",
      "Rapid Cross-Platform DMCA Takedowns",
      "Monetization Leak Recovery",
    ],
    to: "/anti-piracy",
    iconName: "ShieldCheck",
  },
  {
    id: "media-production",
    index: "02",
    tag: "CREATIVE & PRODUCTION",
    title: "Full-Fledged Media Production",
    description:
      "Crafting high-impact visual narratives through Immersive Studio. From broadcast commercials and web series to cinematic brand stories and dynamic short-form video formats optimized for digital platforms.",
    highlights: [
      "End-to-End Conceptualization & Scripting",
      "Broadcast-Grade Cinematography & Post",
      "Multi-Platform Video Formats",
    ],
    to: "/content-production",
    iconName: "Film",
  },
  {
    id: "content-management",
    index: "03",
    tag: "DISTRIBUTION & MONETIZATION",
    title: "Content Management & Monetization",
    description:
      "Maximizing revenue across digital catalog libraries. Certified YouTube multi-channel management, metadata architecture, rights verification, and strategic monetization pipelines across tier-one platforms.",
    highlights: [
      "Certified Partner Channel Management",
      "Global Revenue Optimization & Claiming",
      "Metadata & SEO Architecture",
    ],
    to: "/content-management",
    iconName: "Radio",
  },
  {
    id: "growth-marketing",
    index: "04",
    tag: "PERFORMANCE & ACQUISITION",
    title: "Growth Marketing & Strategy",
    description:
      "Data-driven performance campaigns that propel brands forward. Combining audience segmentation, high-converting creative testing, and multi-channel attribution to turn impressions into scalable revenue.",
    highlights: [
      "Full-Funnel Paid Media Acquisition",
      "Conversion Rate Optimization (CRO)",
      "Real-Time Attribution & Analytics",
    ],
    to: "/growth-marketing",
    iconName: "TrendingUp",
  },
  {
    id: "social-media",
    index: "05",
    tag: "COMMUNITY & ENGAGEMENT",
    title: "Social Media Ecosystems",
    description:
      "Transforming social presences into vibrant community engines. Creative asset production, always-on community management, real-time trend tapping, and brand resonance strategies.",
    highlights: [
      "Always-On Community Management",
      "Viral Short-Form Content Creation",
      "Brand Voice & Visual Identity Systems",
    ],
    to: "/social-media",
    iconName: "Share2",
  },
  {
    id: "influencer-marketing",
    index: "06",
    tag: "CREATOR PARTNERSHIPS",
    title: "Influencer Marketing & Creator Alliances",
    description:
      "Direct relationships with top-tier MENA and international creators. Authentic brand integration, talent vetting, campaign orchestration, and measurable performance reporting.",
    highlights: [
      "Verified Tier-1 Creator Roster",
      "End-to-End Campaign Contracting",
      "Performance & Brand Lift Analytics",
    ],
    to: "/influencers-marketing",
    iconName: "Users",
  },
];

// Centralized Services Overview Offerings for /services Overview Page
export const serviceOfferings: ServiceOfferingItem[] = [
  {
    title: "Full-stack Enterprise Media Management",
    description:
      "Comprehensive media operations, cross-platform distribution rights, and monetization across digital video and streaming networks.",
    metric: "36+ active media campaigns",
    href: "/content-management",
    iconName: "Film",
  },
  {
    title: "Anti-Piracy & Content Protection",
    description:
      "Automated copyright enforcement, real-time leak detection, and revenue recovery powered by RightsHero proprietary technology.",
    metric: "2M+ assets monitored & defended",
    href: "/anti-piracy",
    iconName: "ShieldCheck",
  },
  {
    title: "Growth Marketing & Data Analytics",
    description:
      "Performance-driven marketing strategies, audience acquisition, conversion funnels, and real-time attribution intelligence.",
    metric: "Scalable ROI-focused campaigns",
    href: "/growth-marketing",
    iconName: "TrendingUp",
  },
  {
    title: "Content Production & Studio Facilities",
    description:
      "End-to-end audiovisual production, state-of-the-art studio execution, post-production, and digital-first narrative crafting.",
    metric: "High-impact broadcast quality",
    href: "/content-production",
    iconName: "Video",
  },
  {
    title: "Influencer Marketing & Creator Ecosystem",
    description:
      "Strategic matchmaking between tier-one creators and top brands to spark organic cultural engagement across MENA.",
    metric: "100+ top creator partnerships",
    href: "/influencers-marketing",
    iconName: "Users",
  },
  {
    title: "Social Media Strategy & Engagement",
    description:
      "Data-backed social storytelling, community management, viral trend architecture, and high-velocity platform execution.",
    metric: "Omnichannel brand dominance",
    href: "/social-media",
    iconName: "Share2",
  },
];

// Centralized Metric Stats for /services Overview Page
export const overviewStats: OverviewMetric[] = [
  { value: "36+", label: "Active Enterprise Media Campaigns" },
  { value: "2M+", label: "Protected Digital Assets & Streams" },
  { value: "100+", label: "Top MENA Creator Network" },
  { value: "12+", label: "Years of Media-Tech Innovation" },
];
