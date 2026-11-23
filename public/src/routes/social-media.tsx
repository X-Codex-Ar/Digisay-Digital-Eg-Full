import { createFileRoute } from "@tanstack/react-router";

import ServicePage from "@/features/services/pages/ServicePage";
import { getServicePage } from "@/data/services";

export const Route = createFileRoute("/social-media")({
  head: () => ({
    meta: [{ title: "Social Media - DigiSay" }],
  }),
  component: () => <ServicePage page={getServicePage("social-media")} />,
});
