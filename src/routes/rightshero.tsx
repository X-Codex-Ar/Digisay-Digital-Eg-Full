import { createFileRoute } from "@tanstack/react-router";

import ServicesOverviewPage from "@/features/services/pages/ServicesOverviewPage";

export const Route = createFileRoute("/rightshero")({
  head: () => ({
    meta: [{ title: "Rightshero - DigiSay" }],
  }),
  component: ServicesOverviewPage,
});
