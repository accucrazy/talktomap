import type { Metadata } from "next";
import BowDemo from "@/components/bow/BowDemo";

export const metadata: Metadata = {
  title: "BOW — Closed Commerce Mock-up",
  description:
    "Clickable mock-up: boutique client advisors share private product links, clients buy in the BOW app, and every order is attributed to the advisor's code.",
};

export default function Page() {
  return <BowDemo />;
}
