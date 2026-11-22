export type PrivacyBlockType = "heading" | "subheading" | "paragraph" | "bullet";

export interface PrivacyBlock {
  type: PrivacyBlockType;
  text: string;
}
