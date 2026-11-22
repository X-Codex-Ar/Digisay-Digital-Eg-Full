import { createFileRoute } from "@tanstack/react-router";

import IraqPage from "@/features/iraq/pages/IraqPage";

export const Route = createFileRoute("/content-management-and-monetization-iraq")({
  head: () => ({
    meta: [{ title: "Content Management and Monetization IRAQ - DigiSay" }],
  }),
  component: IraqPage,
});
