import { createFileRoute } from "@tanstack/react-router";

import ServicePage from "@/features/services/pages/ServicePage";
import { getServicePage } from "@/data/services";

export const Route = createFileRoute("/growth-marketing")({
  head: () => ({
    meta: [{ title: "Growth Marketing - DigiSay" }],
  }),
  component: () => <ServicePage page={getServicePage("growth-marketing")} />,
});
