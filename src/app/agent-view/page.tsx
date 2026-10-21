import type { Metadata } from "next";
import { getRepository } from "@/lib/db/client";
import { AgentView } from "./AgentView";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Agent View" };

export default async function AgentViewPage({ searchParams }: { searchParams: Promise<{ member?: string }> }) {
  const { member } = await searchParams;
  const repo = await getRepository();
  const members = await repo.listMembers();
  const id = members.some((m) => m.id === member) ? member! : (members[0]?.id ?? "maya");
  const [profile, transcript, settings] = await Promise.all([repo.getProfile(id), repo.getTranscript(id), repo.getSettings(id)]);

  if (!profile || !transcript) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="text-xl font-semibold">No profile yet</h1>
        <p className="mt-2 text-white/60">Finish your career call and your Agent View will appear here.</p>
      </div>
    );
  }
  return <AgentView key={id} members={members} profile={profile} transcript={transcript} initialSettings={settings} />;
}
