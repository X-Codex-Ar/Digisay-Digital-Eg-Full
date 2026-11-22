export type PrivacyBlockType = "heading" | "subheading" | "paragraph" | "bullet";

export interface PrivacyBlock {
  type: PrivacyBlockType;
  text: string;
}

export interface PrivacySection {
  id: string;
  number: string;
  title: string;
  summary: string;
  iconName: "Globe" | "Database" | "ShieldCheck" | "BarChart3" | "UserCheck" | "Scale";
  blocks: PrivacyBlock[];
}
