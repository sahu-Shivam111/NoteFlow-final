function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function safeFileBase(title) {
  return (title || "note").replace(/\s+/g, "_");
}

export async function exportNoteAsPDF(note, summary) {
  const [{ default: jsPDF }, { htmlToText }] = await Promise.all([
    import("jspdf"),
    import("html-to-text"),
  ]);

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const maxLineWidth = pageWidth - margin * 2;
  let cursorY = 20;

  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  const titleLines = doc.splitTextToSize(note.title, maxLineWidth);
  doc.text(titleLines, margin, cursorY);
  cursorY += titleLines.length * 10 + 5;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text(`Created on: ${new Date(note.createdAt).toLocaleDateString()}`, margin, cursorY);
  cursorY += 15;
  doc.setTextColor(0);

  if (summary) {
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("AI Smart Summary", margin, cursorY);
    cursorY += 7;

    doc.setFontSize(11);
    doc.setFont("helvetica", "italic");
    const summaryLines = doc.splitTextToSize(summary, maxLineWidth);
    doc.text(summaryLines, margin, cursorY);
    cursorY += summaryLines.length * 6 + 15;
  }

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  const text = htmlToText(note.content, { wordwrap: 130 });
  const contentLines = doc.splitTextToSize(text, maxLineWidth);

  contentLines.forEach((line) => {
    if (cursorY > pageHeight - margin) {
      doc.addPage();
      cursorY = 20;
    }
    doc.text(line, margin, cursorY);
    cursorY += 7;
  });

  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i += 1) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: "center" });
  }

  doc.save(`${safeFileBase(note.title)}.pdf`);
}

export async function exportNoteAsMarkdown(note) {
  const { htmlToText } = await import("html-to-text");
  const text = htmlToText(note.content);
  const mdContent = `# ${note.title}\n\n**Created on:** ${new Date(note.createdAt).toLocaleDateString()}\n\n${text}`;
  const blob = new Blob([mdContent], { type: "text/markdown" });
  triggerDownload(blob, `${safeFileBase(note.title)}.md`);
}

export function exportNoteAsJSON(note) {
  const blob = new Blob([JSON.stringify(note, null, 2)], { type: "application/json" });
  triggerDownload(blob, `${safeFileBase(note.title)}.json`);
}
