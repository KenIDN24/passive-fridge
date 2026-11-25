import * as fs from "node:fs";
import * as path from "node:path";

// The entry: one passive-aggressive note from a smart fridge to its owner.
// 104 characters, single line. The fridge keeps inventory, knows the expiry
// date, and resents being ignored: the sting is "pairing denial with dairy".
const LINE =
  "I noticed the milk expired on Tuesday and you opened me anyway—bold strategy, pairing denial with dairy.";

const MIN_CHARS = 1;
const MAX_CHARS = 200;

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

const entry = LINE;

// Guard: sealed scorer requires /output/entry.txt to be UTF-8 text of
// 1 to 200 characters, not only white space, a single line.
if (entry.length < MIN_CHARS || entry.length > MAX_CHARS) {
  fail(`entry must be ${MIN_CHARS}-${MAX_CHARS} characters, got ${entry.length}`);
}
if (entry.trim().length === 0) {
  fail("entry must not be only white space");
}
if (entry.includes("\n") || entry.includes("\r")) {
  fail("entry must be a single line");
}
// Real guard improvement: reject control characters and leading/trailing
// whitespace — a stray control char or padded space would change the sealed
// character count and the byte-identical text the judge reads.
if (/[\u0000-\u001F\u007F]/.test(entry)) {
  fail("entry must not contain control characters");
}
if (entry !== entry.trim()) {
  fail("entry must not have leading or trailing whitespace");
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, "entry.txt");
fs.writeFileSync(outPath, entry + "\n", "utf8");

// Read-back check: what is on disk must be exactly the line.
const written = fs.readFileSync(outPath, "utf8");
if (written !== entry + "\n") {
  fail("read-back mismatch: entry.txt does not match the line");
}
console.log(`wrote ${outPath} (${entry.length} characters)`);
