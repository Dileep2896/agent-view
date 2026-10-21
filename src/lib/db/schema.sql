-- Agent View schema (real Postgres via PGlite).
create table if not exists members (
  id        text primary key,
  position  int  not null,
  name      text not null,
  headline  text not null
);

create table if not exists transcripts (
  member_id text primary key references members(id),
  turns     jsonb not null
);

create table if not exists claims (
  id         text primary key,
  member_id  text not null references members(id),
  position   int  not null,
  category   text not null check (category in ('experience','strengths','goals','preferences','private_facts')),
  field      text not null,
  label      text not null,
  value      text not null,
  quote      text not null,
  turn_id    int  not null,
  span_start int  not null,
  span_end   int  not null check (span_end > span_start),
  predicate  text,
  fact       jsonb
);
create index if not exists claims_member_idx on claims(member_id, position);

create table if not exists visibility_settings (
  member_id         text primary key references members(id),
  consent           boolean not null,
  category_defaults jsonb not null,
  claim_overrides   jsonb not null,
  predicate_states  jsonb not null,
  updated_at        timestamptz not null default now()
);
