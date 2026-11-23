import { createFileRoute } from "@tanstack/react-router";

import ServicePage from "@/features/services/pages/ServicePage";
import { getServicePage } from "@/data/services";

export const Route = createFileRoute("/content-production")({
  head: () => ({
    meta: [{ title: "Digital Content Production - DigiSay" }],
  }),
  component: () => <ServicePage page={getServicePage("content-production")} />,
});
