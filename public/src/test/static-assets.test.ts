import { describe, expect, it } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const publicRoot = path.resolve(__dirname, "..", "..");
const staticDir = path.join(publicRoot, "static");
const srcDir = path.join(publicRoot, "src");

const IMAGE_EXTENSIONS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".gif",
  ".svg",
  ".ico",
  ".avif",
]);

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

function hasSvgRoot(buf: Buffer): boolean {
  const head = buf.subarray(0, 512).toString("utf8");
  const withoutPreamble = head
    .replace(/^\uFEFF/, "")
    .replace(/^\s*<\?xml[\s\S]*?\?>/, "")
    .replace(/^(?:\s*<!--[\s\S]*?-->|\s*<!DOCTYPE[^>]*>|\s+)*/i, "");
  return withoutPreamble.startsWith("<svg");
}

function hasValidMagicBytes(file: string, ext: string): boolean {
  const buf = fs.readFileSync(file);
  if (buf.length < 4) return false;
  switch (ext) {
    case ".png":
      return buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47;
    case ".jpg":
    case ".jpeg":
      return buf[0] === 0xff && buf[1] === 0xd8;
    case ".webp":
      return (
        buf.length >= 12 &&
        buf.subarray(0, 4).toString("ascii") === "RIFF" &&
        buf.subarray(8, 12).toString("ascii") === "WEBP"
      );
    case ".gif":
      return buf.subarray(0, 4).toString("ascii") === "GIF8";
    case ".ico":
      return buf[0] === 0x00 && buf[1] === 0x00 && buf[2] === 0x01 && buf[3] === 0x00;
    case ".avif":
      return buf.subarray(4, 8).toString("ascii") === "ftyp";
    case ".svg":
      return hasSvgRoot(buf);
    default:
      return true;
  }
}

describe("static image assets", () => {
  it("every image file in static/ has content matching its extension", () => {
    const offenders: string[] = [];
    for (const file of walk(staticDir)) {
      const ext = path.extname(file).toLowerCase();
      if (!IMAGE_EXTENSIONS.has(ext)) continue;
      if (!hasValidMagicBytes(file, ext)) {
        offenders.push(path.relative(publicRoot, file));
      }
    }
    expect(offenders).toEqual([]);
  });

  it("every local asset referenced from src exists in static/", () => {
    const refPattern =
      /["'`]\/((?:assets|favicon)[^"'`\s]*?\.(?:png|jpe?g|webp|gif|svg|ico|avif|mp4|webm|pdf))["'`]/gi;
    const missing: string[] = [];
    const sourceFiles = walk(srcDir).filter((f) => /\.(ts|tsx|js|jsx|css)$/.test(f));
    for (const file of sourceFiles) {
      if (file.endsWith("static-assets.test.ts")) continue;
      const text = fs.readFileSync(file, "utf8");
      for (const match of text.matchAll(refPattern)) {
        const rel = match[1];
        if (!fs.existsSync(path.join(staticDir, rel))) {
          missing.push(`${path.relative(publicRoot, file)} -> /${rel}`);
        }
      }
    }
    expect(missing).toEqual([]);
  });
});

describe("svg root detection", () => {
  function svgCheck(content: string): boolean {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "svg-check-"));
    const file = path.join(dir, "sample.svg");
    fs.writeFileSync(file, content);
    try {
      return hasValidMagicBytes(file, ".svg");
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  }

  it("accepts a plain SVG document", () => {
    expect(svgCheck('<svg xmlns="http://www.w3.org/2000/svg"></svg>')).toBe(true);
  });

  it("accepts an XML-prefixed SVG document", () => {
    expect(
      svgCheck(
        '<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg"></svg>',
      ),
    ).toBe(true);
  });

  it("rejects an XML-prefixed HTML error page", () => {
    expect(svgCheck('<?xml version="1.0"?><html>error</html>')).toBe(false);
  });

  it("rejects HTML stored as .svg", () => {
    expect(svgCheck("<html><body>not found</body></html>")).toBe(false);
  });
});
