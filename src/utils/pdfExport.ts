/**
 * PDF Export Utility for Rental Agreements
 * Uses html2pdf.js for client-side PDF generation
 */

export interface PDFExportOptions {
  filename?: string;
  margin?: number | number[];
  image?: { type: string; quality: number };
  html2canvas?: { scale: number; useCORS: boolean };
  jsPDF?: { unit: string; format: string; orientation: string };
}

/**
 * Export HTML element to PDF
 * @param element - HTML element to export
 * @param options - PDF export options
 */
export async function exportToPDF(
  element: HTMLElement,
  options: PDFExportOptions = {}
): Promise<void> {
  // Dynamically import html2pdf to avoid SSR issues
  const html2pdf = (await import('html2pdf.js')).default;

  const defaultOptions = {
    margin: [10, 10, 10, 10],
    filename: options.filename || `rental-agreement-${Date.now()}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, letterRendering: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
  };

  const mergedOptions = { ...defaultOptions, ...options };

  try {
    await html2pdf().set(mergedOptions).from(element).save();
  } catch (error) {
    console.error('PDF export failed:', error);
    throw new Error('Failed to generate PDF. Please try again.');
  }
}

/**
 * Generate PDF filename from booking details
 */
export function generatePDFFilename(
  customerName: string,
  confirmationNumber?: string,
  bookingId?: string
): string {
  const sanitizedName = customerName.replace(/[^a-zA-Z0-9]/g, '_');
  const identifier = confirmationNumber || bookingId || Date.now().toString();
  const date = new Date().toISOString().split('T')[0];
  
  return `Captura_Rental_Agreement_${sanitizedName}_${identifier}_${date}.pdf`;
}

/**
 * Print the rental agreement
 */
export function printAgreement(): void {
  window.print();
}

