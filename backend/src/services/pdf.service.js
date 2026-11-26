const pdfParsePackage = require("pdf-parse");

/**
 * Extract plain text from a PDF buffer using either v1 or v2 of pdf-parse.
 */
async function extractPdfText(dataBuffer) {
  if (pdfParsePackage.PDFParse) {
    const parser = new pdfParsePackage.PDFParse({ data: dataBuffer });
    const result = await parser.getText();
    await parser.destroy();
    return result.text;
  }

  if (typeof pdfParsePackage === "function") {
    const result = await pdfParsePackage(dataBuffer);
    return result.text;
  }

  if (pdfParsePackage.default && typeof pdfParsePackage.default === "function") {
    const result = await pdfParsePackage.default(dataBuffer);
    return result.text;
  }

  throw new Error("Compatible PDF parser not found in pdf-parse package");
}

module.exports = { extractPdfText };
