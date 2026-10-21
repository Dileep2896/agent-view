import fs from "node:fs";
import path from "node:path";

/** Reads schema.sql (kept as a plain SQL file so it can be reviewed or run with psql). */
export function readSchema(): string {
  return fs.readFileSync(path.join(process.cwd(), "src/lib/db/schema.sql"), "utf8");
}
