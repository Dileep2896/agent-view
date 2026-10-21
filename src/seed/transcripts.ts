import type { Transcript, Turn } from "@/lib/types";

function turns(lines: string[]): Turn[] {
  // Calls always open with the AI interviewer, then alternate.
  return lines.map((text, id) => ({ id, speaker: id % 2 === 0 ? "interviewer" : "member", text }));
}

export const transcripts: Transcript[] = [
  {
    memberId: "maya",
    turns: turns([
      "Hi Maya, I'm your AI career interviewer. In about ten minutes I'll learn what you've done, what you're great at, and what you want next. You decide what gets shared. Ready?",
      "Ready. I'm a Senior Account Executive at Ramp, based in New York.",
      "When did you start there, and what does your book look like?",
      "I joined in 2022. Last year I closed $3.1M in new ARR, mostly mid-market finance teams.",
      "What are you unusually good at?",
      "Honestly, building outbound from zero. When I joined there was no outbound motion for mid-market, so I wrote the sequences and the playbook myself.",
      "Who do you sell to best?",
      "CFOs and controllers. I can speak their language on close cycles and spend controls.",
      "What do you want next?",
      "I want to be the founding AE at a Series A fintech, and eventually build and lead the first sales team.",
      "How do you like to work?",
      "Hybrid or in-person in NYC. I like a small team where I own the whole cycle.",
      "Let's cover the private details. You can keep any of these off your profile. What base salary would you need?",
      "I wouldn't move for less than $135K base.",
      "Are you authorized to work in the US, and would you need sponsorship?",
      "I'm a US citizen, so no sponsorship needed.",
      "Are you actively looking, and would you relocate?",
      "I'm actively looking right now, but I'm staying in New York, so no relocation.",
    ]),
  },
  {
    memberId: "dev",
    turns: turns([
      "Hi Dev, I'm your AI career interviewer. Tell me where you are today and we'll go from there.",
      "I'm a Staff Backend Engineer at Tiltpay, working out of San Francisco.",
      "How long have you been there, and what do you own?",
      "Since 2021. I own the ledger service that moves about $40B a year in card payments.",
      "What are you unusually good at?",
      "Making payment systems boringly reliable. I led the migration to idempotent, double-entry writes and we went from weekly incidents to almost none.",
      "What languages and tools do you reach for?",
      "Go and Postgres, mostly. Some Kafka for the event stream.",
      "What do you want next?",
      "I want to own payments infrastructure end to end at a company where money movement is the product.",
      "How do you like to work?",
      "Remote-first or hybrid. I do my best work with long focus blocks.",
      "Now the private part. What base would you need, and are you authorized to work in the US?",
      "At least $205K base. I'm on an H-1B, so I'm authorized, but I'd need sponsorship to transfer.",
      "Are you looking right now? Would you relocate?",
      "Open to the right role, not urgently. I'd relocate to New York for it.",
    ]),
  },
  {
    memberId: "lucia",
    turns: turns([
      "Hi Lucia, I'm your AI career interviewer. What do you do today?",
      "I'm a Senior Product Designer at Northwind Studio. I work remotely from Lisbon.",
      "How long have you been there?",
      "Since 2020. I built our design system from scratch and it's now used by four product teams.",
      "What are you unusually good at?",
      "Turning messy workflows into calm interfaces. I'm strongest on complex B2B tools, like dashboards and admin consoles.",
      "How do you work with engineers?",
      "I prototype in code with React, so handoff is mostly a pull request.",
      "What do you want next?",
      "I want to lead design systems at a product-led company, ideally in climate or health.",
      "How do you like to work?",
      "Fully remote, with a few overlap hours with US time zones.",
      "Private part: what base would you want, and do you have US work authorization?",
      "I'd want $150K or more. I'm an EU citizen, so no US work authorization.",
      "Would you need sponsorship, or relocate?",
      "I won't relocate, and I'd only work as a contractor, so no sponsorship.",
      "Are you actively looking?",
      "Not actively. I'm happy where I am unless something great comes along.",
    ]),
  },
];
