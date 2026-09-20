"use client";

import { useState } from "react";
import { Check, Copy, Download, FileText, Loader2 } from "lucide-react";
import { type DecisionReport, markdownToPlain, reportToMarkdown } from "@/lib/report";
import { Button } from "./ui/button";

function slug(text: string) {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "decision"
  );
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function ExportMenu({ report }: { report: DecisionReport }) {
  const [copied, setCopied] = useState(false);
  const [pdfBusy, setPdfBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const markdown = reportToMarkdown(report);
  const base = `founder-arena-${slug(report.decisionText)}`;

  const copy = async () => {
    setError(null);
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("Clipboard access was blocked. Download the Markdown instead.");
    }
  };

  const downloadMarkdown = () => {
    setError(null);
    downloadBlob(new Blob([markdown], { type: "text/markdown;charset=utf-8" }), `${base}.md`);
  };

  const downloadPdf = async () => {
    setError(null);
    setPdfBusy(true);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      const margin = 48;
      const width = pageW - margin * 2;
      let y = margin;

      const ensure = (h: number) => {
        if (y + h > pageH - margin) {
          doc.addPage();
          y = margin;
        }
      };
      const heading = (text: string, size: number) => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(size);
        const lines = doc.splitTextToSize(text, width) as string[];
        ensure(lines.length * size * 1.3 + 8);
        doc.text(lines, margin, y);
        y += lines.length * size * 1.3 + 6;
      };
      const paragraph = (text: string, size = 10.5) => {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(size);
        const chunks = markdownToPlain(text).split(/\n{2,}/);
        for (const chunk of chunks) {
          const lines = doc.splitTextToSize(chunk, width) as string[];
          for (const line of lines) {
            ensure(size * 1.45);
            doc.text(line, margin, y);
            y += size * 1.45;
          }
          y += 5;
        }
      };

      heading("Founder Arena: Decision Report", 20);
      doc.setTextColor(110);
      paragraph(`Generated ${new Date(report.createdAt).toLocaleString()}`, 9);
      doc.setTextColor(0);
      heading("The Decision", 14);
      paragraph(report.decisionText);
      heading("Final Verdict", 16);
      const ratingsBody =
        report.verdict.ratings && report.verdict.ratings.length > 0
          ? report.verdict.ratings
              .map((r) => `• ${r.category}: ${r.score}/${r.max}${r.rationale ? ` - ${r.rationale}` : ""}`)
              .join("\n")
          : report.verdict.ratingsMarkdown;

      const sections: [string, string][] = [
        ...(ratingsBody ? ([["Council Ratings", ratingsBody]] as [string, string][]) : []),
        ["Key Opportunities", report.verdict.opportunities],
        ["Key Risks", report.verdict.risks],
        ["Blind Spots", report.verdict.blindSpots],
        ["Missing Information", report.verdict.missingInformation],
        ["Recommended Actions", report.verdict.recommendedActions],
        ["Final Summary", report.verdict.finalSummary],
      ];
      for (const [title, body] of sections) {
        heading(title, 12.5);
        paragraph(body || "None recorded.");
      }
      heading("Council Testimony", 16);
      for (const r of report.responses) {
        heading(`${r.agent}, ${r.role}`, 12.5);
        paragraph(r.text);
      }
      doc.save(`${base}.pdf`);
    } catch (err) {
      console.error(err);
      setError("PDF generation failed. Try the Markdown export.");
    } finally {
      setPdfBusy(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-2 sm:items-end">
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={copy}>
          {copied ? <Check className="text-emerald-400" /> : <Copy />}
          {copied ? "Copied" : "Copy Markdown"}
        </Button>
        <Button variant="outline" size="sm" onClick={downloadMarkdown}>
          <FileText />
          Download .md
        </Button>
        <Button size="sm" onClick={downloadPdf} disabled={pdfBusy}>
          {pdfBusy ? <Loader2 className="animate-spin" /> : <Download />}
          {pdfBusy ? "Rendering…" : "Download PDF"}
        </Button>
      </div>
      {error && <p className="text-xs text-amber-300">{error}</p>}
    </div>
  );
}
