import { createFileRoute } from "@tanstack/react-router";

import ServicePage from "@/features/services/pages/ServicePage";
import { getServicePage } from "@/data/services";

export const Route = createFileRoute("/content-management")({
  head: () => ({
    meta: [{ title: "Content Management and Monetization - DigiSay" }],
  }),
  component: () => <ServicePage page={getServicePage("content-management")} />,
});
