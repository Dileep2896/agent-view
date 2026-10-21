import { describe, expect, it } from "vitest";
import { searchMember } from "@/lib/search";
import { InMemoryProfileRepository } from "@/lib/db/memory-repo";
import { defaultSettings } from "@/seed";
import { GET } from "@/app/api/mcp/search/route";

describe("searchMember", () => {
  it("returns an MCP-shaped card and a match", async () => {
    const repo = new InMemoryProfileRepository();
    const r = await searchMember(repo, "Founding AE, NYC, Series A fintech, $140K base", "maya");
    expect(r.status).toBe(200);
    if (r.status !== 200) return;
    expect(r.body.card).toMatchObject({ ref: "mem_maya", network: "member", name: "Maya Chen" });
    expect(r.body.match.surfaces).toBe(true);
    expect(r.body.predicates.salary_min).toBe("meets");
  });

  it("returns withheld when consent is off", async () => {
    const repo = new InMemoryProfileRepository();
    await repo.saveSettings("maya", { ...defaultSettings(), consent: false });
    const r = await searchMember(repo, "Founding AE", "maya");
    if (r.status !== 200) throw new Error("expected 200");
    expect(r.body.withheld).toBe("consent");
    expect(r.body.card).toBeUndefined();
    expect(JSON.stringify(r.body)).not.toContain("Ramp");
  });

  it("404s for an unknown member", async () => {
    const r = await searchMember(new InMemoryProfileRepository(), "x", "ghost");
    expect(r.status).toBe(404);
  });
});

describe("GET /api/mcp/search", () => {
  it("validates params", async () => {
    const res = await GET(new Request("http://localhost/api/mcp/search?member=maya"));
    expect(res.status).toBe(400);
  });

  it("serves the card from the PGlite repository", async () => {
    const res = await GET(new Request("http://localhost/api/mcp/search?member=dev&q=" + encodeURIComponent("Backend engineer, remote, Go")));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.card.title).toBe("Staff Backend Engineer");
    expect(body.match.verdicts.title).toBe("match");
  });
});
