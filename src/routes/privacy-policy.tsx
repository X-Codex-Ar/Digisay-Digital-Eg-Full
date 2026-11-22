import { createFileRoute } from "@tanstack/react-router";

import PrivacyPage from "@/features/privacy/pages/PrivacyPage";

export const Route = createFileRoute("/privacy-policy")({
  head: () => ({
    meta: [{ title: "Privacy Policy - DigiSay" }],
  }),
  component: PrivacyPage,
});
