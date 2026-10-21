import { describe, expect, it } from "vitest";
import { seed, defaultSettings } from "@/seed";
import { applyVisibility, resolveClaimVisibility } from "@/lib/visibility";
import { CATEGORIES, PRIVATE_TOKEN, type Category, type VisibilitySettings } from "@/lib/types";

const maya = seed[0]!.profile;

function settingsWith(patch: Partial<VisibilitySettings>): VisibilitySettings {
  return { ...defaultSettings(), ...patch };
}

describe("resolveClaimVisibility", () => {
  it("uses the category default when no override exists", () => {
    const company = maya.claims.find((c) => c.field === "company")!;
    expect(resolveClaimVisibility(company, defaultSettings())).toBe("visible");
  });

  it("a claim override beats the category default", () => {
    const company = maya.claims.find((c) => c.field === "company")!;
    const s = settingsWith({ claimOverrides: { [company.id]: "private" } });
    expect(resolveClaimVisibility(company, s)).toBe("private");
  });
});

describe("applyVisibility", () => {
  it("returns only { withheld: 'consent' } when consent is off", () => {
    const p = applyVisibility(maya, settingsWith({ consent: false }));
    expect(p).toEqual({ withheld: "consent", memberId: "maya" });
    expect(JSON.stringify(p)).not.toContain("Maya");
  });

  it("replaces a private structured field with the literal [private]", () => {
    const company = maya.claims.find((c) => c.field === "company")!;
    const p = applyVisibility(maya, settingsWith({ claimOverrides: { [company.id]: "private" } }));
    if (p.withheld) throw new Error("unexpected");
    expect(p.fields.company).toBe(PRIVATE_TOKEN);
    expect(JSON.stringify(p)).not.toContain("Ramp");
  });

  it("keeps visible structured fields and marks emphasized claims", () => {
    const outbound = maya.claims.find((c) => c.field === "outbound")!;
    const p = applyVisibility(maya, settingsWith({ claimOverrides: { [outbound.id]: "emphasize" } }));
    if (p.withheld) throw new Error("unexpected");
    expect(p.fields.title).toBe("Senior Account Executive");
    expect(p.claims.find((c) => c.id === outbound.id)?.emphasized).toBe(true);
  });

  it("drops private free-text claims entirely", () => {
    const p = applyVisibility(maya, defaultSettings());
    if (p.withheld) throw new Error("unexpected");
    expect(p.claims.some((c) => c.category === "private_facts")).toBe(false);
  });

  // Property-style: every member x every combination of category toggles (2^5 x 3 = 96 cases).
  const combos: Record<Category, "visible" | "private">[] = [];
  for (let mask = 0; mask < 1 << CATEGORIES.length; mask++) {
    combos.push(
      Object.fromEntries(CATEGORIES.map((c, i) => [c, mask & (1 << i) ? "private" : "visible"])) as Record<
        Category,
        "visible" | "private"
      >,
    );
  }

  it("never leaks a private string into JSON.stringify(projection) (96 combinations)", () => {
    let checked = 0;
    for (const { profile } of seed) {
      for (const categoryDefaults of combos) {
        const s = settingsWith({ categoryDefaults });
        const json = JSON.stringify(applyVisibility(profile, s));
        for (const c of profile.claims) {
          if (resolveClaimVisibility(c, s) === "private") {
            expect(json, `${c.id} leaked`).not.toContain(c.value);
          } else {
            expect(json).toContain(JSON.stringify(c.value).slice(1, -1));
          }
        }
        checked++;
      }
    }
    expect(checked).toBe(96);
  });
});
