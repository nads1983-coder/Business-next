import { NextResponse } from "next/server";
import { getDownload } from "@/content/authority";

type DownloadRouteProps = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: Request, { params }: DownloadRouteProps) {
  const { slug } = await params;
  const download = getDownload(slug);

  if (!download) {
    return new NextResponse("Not found", { status: 404 });
  }

  const pdf = createSimplePdf([
    "Business Sorted",
    download.title,
    download.description,
    "",
    "Checklist",
    ...download.items.map((item, index) => `${index + 1}. ${item}`),
    "",
    "Official sources checked",
    ...download.sources.map((source) => `${source.label}: ${source.href}`),
    "",
    "This printable checklist is general guidance, not legal or accounting advice."
  ]);

  return new NextResponse(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename=\"${download.slug}.pdf\"`,
      "Cache-Control": "public, max-age=3600"
    }
  });
}

function createSimplePdf(lines: readonly string[]) {
  const escapedLines = lines.map((line) => line.replace(/[\\()]/g, "\\$&"));
  const text = escapedLines.map((line, index) => `BT /F1 11 Tf 56 ${770 - index * 22} Td (${line}) Tj ET`).join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${Buffer.byteLength(text)} >>\nstream\n${text}\nendstream`
  ];
  const parts = ["%PDF-1.4\n"];
  const offsets: number[] = [];

  for (const [index, object] of objects.entries()) {
    offsets.push(Buffer.byteLength(parts.join("")));
    parts.push(`${index + 1} 0 obj\n${object}\nendobj\n`);
  }

  const xrefOffset = Buffer.byteLength(parts.join(""));
  parts.push(`xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`);
  for (const offset of offsets) {
    parts.push(`${offset.toString().padStart(10, "0")} 00000 n \n`);
  }
  parts.push(`trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`);

  return Buffer.from(parts.join(""), "utf8");
}
