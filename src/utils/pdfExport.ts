/**
 * PDF Export Utility for Rental Agreements
 * Uses html2canvas with optimized settings for compatibility
 */

export interface PDFExportOptions {
  filename?: string;
}

/**
 * Export HTML element to PDF by converting to image first
 * @param element - HTML element to export
 * @param options - PDF export options
 */
export async function exportToPDF(
  element: HTMLElement,
  options: PDFExportOptions = {}
): Promise<void> {
  try {
    // Dynamically import libraries
    const html2canvas = (await import('html2canvas')).default;
    const { jsPDF } = await import('jspdf');

    const filename = options.filename || `rental-agreement-${Date.now()}.pdf`;

    // Show element temporarily for better rendering
    const originalPosition = element.style.position;
    const originalLeft = element.style.left;
    const originalTop = element.style.top;

    element.style.position = 'fixed';
    element.style.left = '0';
    element.style.top = '0';

    // Wait for rendering
    await new Promise(resolve => setTimeout(resolve, 100));

    // Convert the element to canvas using html2canvas with optimized settings
    const canvas = await html2canvas(element, {
      scale: 2, // High quality
      useCORS: false, // Disable CORS to avoid issues
      allowTaint: true, // Allow tainted canvas
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
      removeContainer: true,
      imageTimeout: 15000,
      foreignObjectRendering: false, // Better compatibility
      onclone: (clonedDoc) => {
        // Ensure fonts are loaded in cloned document
        const clonedElement = clonedDoc.querySelector('[style*="font"]');
        if (clonedElement) {
          // Force font smoothing
          const allElements = clonedDoc.querySelectorAll('*');
          allElements.forEach((el: any) => {
            if (el.style) {
              el.style.webkitFontSmoothing = 'antialiased';
              el.style.mozOsxFontSmoothing = 'grayscale';
            }
          });
        }
      }
    });

    // Restore original position
    element.style.position = originalPosition;
    element.style.left = originalLeft;
    element.style.top = originalTop;

    // Convert canvas to image data URL
    const dataUrl = canvas.toDataURL('image/png', 1.0);

    // Get canvas dimensions
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;

    // A4 dimensions in mm
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 10;

    // Calculate how to fit the image on the page
    const availableWidth = pageWidth - (margin * 2);
    const availableHeight = pageHeight - (margin * 2);

    // Calculate scaling to fit width
    const imgWidthMM = availableWidth;
    const imgHeightMM = (imgHeight * availableWidth) / imgWidth;

    // Create PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    let yPosition = margin;
    let remainingHeight = imgHeightMM;

    // Add pages as needed
    let isFirstPage = true;
    while (remainingHeight > 0) {
      if (!isFirstPage) {
        pdf.addPage();
        yPosition = margin;
      }

      const heightToAdd = Math.min(remainingHeight, availableHeight);

      // Calculate which part of the image to show
      const sourceY = imgHeightMM - remainingHeight;
      const sourceHeight = heightToAdd;

      pdf.addImage(
        dataUrl,
        'PNG',
        margin,
        yPosition - sourceY,
        imgWidthMM,
        imgHeightMM
      );

      remainingHeight -= availableHeight;
      isFirstPage = false;
    }

    // Save the PDF
    pdf.save(filename);
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

