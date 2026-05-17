export async function extractResumeText(
  buffer: Buffer | undefined,
  fileName?: string,
): Promise<string | undefined> {
  if (!buffer?.length) return undefined;
  const name = (fileName ?? '').toLowerCase();

  if (name.endsWith('.pdf')) {
    try {
      const { PDFParse } = await import('pdf-parse');
      const parser = new PDFParse({ data: buffer });
      const textResult = await parser.getText();
      await parser.destroy();
      const text = textResult.text?.replace(/\s+/g, ' ').trim();
      if (text && text.length > 40) return text.slice(0, 12000);
    } catch (err) {
      console.warn('[resume] PDF parse failed:', err);
    }
  }

  const asText = buffer.toString('utf8').replace(/\0/g, ' ').trim();
  if (asText.length > 80 && /[a-zA-Z]{4,}/.test(asText)) {
    return asText.slice(0, 12000);
  }

  return fileName
    ? `Resume file "${fileName}" uploaded (${buffer.length} bytes). Infer skills from filename and linked profiles.`
    : undefined;
}
