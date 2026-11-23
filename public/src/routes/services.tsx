import { createFileRoute } from "@tanstack/react-router";

import ServicesOverviewPage from "@/features/services/pages/ServicesOverviewPage";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [{ title: "Services - DigiSay" }],
  }),
  component: ServicesOverviewPage,
});
