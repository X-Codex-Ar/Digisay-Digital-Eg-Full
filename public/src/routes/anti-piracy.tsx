import { createFileRoute } from "@tanstack/react-router";

import ServicePage from "@/features/services/pages/ServicePage";
import { getServicePage } from "@/data/services";

export const Route = createFileRoute("/anti-piracy")({
  head: () => ({
    meta: [{ title: "Anti-Piracy - DigiSay" }],
  }),
  component: () => <ServicePage page={getServicePage("anti-piracy")} />,
});
