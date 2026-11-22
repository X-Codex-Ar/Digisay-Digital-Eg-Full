import { createFileRoute } from "@tanstack/react-router";

import ServicePage from "@/features/services/pages/ServicePage";
import { getServicePage } from "@/data/services";

export const Route = createFileRoute("/influencers-marketing")({
  head: () => ({
    meta: [{ title: "Influencers Marketing - DigiSay" }],
  }),
  component: () => <ServicePage page={getServicePage("influencers-marketing")} />,
});
