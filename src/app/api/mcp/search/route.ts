import { z } from "zod";
import { getRepository } from "@/lib/db/client";
import { searchMember } from "@/lib/search";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const Params = z.object({
  q: z.string().trim().min(1).max(300),
  member: z.string().regex(/^[a-z0-9_-]{1,40}$/),
});

/** GET /api/mcp/search?q=...&member=... -> { card | withheld, match }. Mirrors an MCP-style search_people card. */
export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const parsed = Params.safeParse({ q: url.searchParams.get("q") ?? "", member: url.searchParams.get("member") ?? "" });
  if (!parsed.success) {
    return Response.json({ error: "invalid params", issues: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  const result = await searchMember(await getRepository(), parsed.data.q, parsed.data.member);
  return Response.json(result.body, { status: result.status });
}
