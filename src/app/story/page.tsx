import type { Metadata } from "next";
import { storyNumbers } from "@/lib/score";
import { seedMember, mayaAfter } from "@/seed";
import { resolveClaimVisibility } from "@/lib/visibility";
import { StoryClient } from "./StoryClient";

export const metadata: Metadata = { title: "Story | Agent View" };

export default function StoryPage() {
  const maya = seedMember("maya");
  if (!maya) throw new Error("seed missing");
  const pick = ["maya-01", "maya-02", "maya-06", "maya-12"];
  const diagram = pick
    .map((id) => maya.profile.claims.find((c) => c.id === id)!)
    .map((c) => ({
      quote: c.quote,
      label: c.label,
      value: c.value,
      private: resolveClaimVisibility(c, mayaAfter) === "private",
    }));
  const company = maya.profile.claims.find((c) => c.field === "company")!;
  return <StoryClient numbers={storyNumbers()} diagram={diagram} demo={{ label: company.label, value: company.value }} />;
}
