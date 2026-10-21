import { describe, expect, it, vi } from "vitest";
import { render, screen, within, fireEvent } from "@testing-library/react";
import { AgentView } from "@/app/agent-view/AgentView";
import { seed, defaultSettings } from "@/seed";

vi.mock("@/app/agent-view/actions", () => ({ saveSettings: vi.fn(async () => ({ ok: true })) }));

const members = seed.map((s) => s.profile.member);
const maya = seed[0]!;

function renderMaya() {
  return render(
    <AgentView members={members} profile={maya.profile} transcript={maya.transcript} initialSettings={defaultSettings()} />,
  );
}

describe("AgentView", () => {
  it("shows Ramp in the agent card until Current company is set to Private", () => {
    renderMaya();
    const json = screen.getByTestId("agent-card-json");
    expect(json).toHaveTextContent("Ramp");

    const control = screen.getByRole("radiogroup", { name: /Current company: Ramp/ });
    fireEvent.click(within(control).getByRole("radio", { name: "Private" }));

    expect(screen.getByTestId("agent-card-json")).not.toHaveTextContent("Ramp");
    expect(screen.getByTestId("agent-card-json")).toHaveTextContent("[private]");
  });

  it("clicking a claim marks its transcript span aria-current", () => {
    renderMaya();
    fireEvent.click(screen.getByRole("button", { name: /Building outbound from zero/ }));
    const spanEl = screen.getByTestId("span-maya-06");
    expect(spanEl).toHaveAttribute("aria-current", "true");
    expect(spanEl).toHaveTextContent("building outbound from zero");
  });

  it("turning off consent collapses the card to withheld", () => {
    renderMaya();
    fireEvent.click(screen.getByRole("switch", { name: /Discoverable by AI agents/ }));
    expect(screen.getByTestId("agent-card-json")).toHaveTextContent('"withheld"');
    expect(screen.getByTestId("agent-card-json")).not.toHaveTextContent("Maya Chen");
  });
});
