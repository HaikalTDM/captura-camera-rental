/**
 * PDF Export Utility for Rental Agreements
 * Uses html2canvas with optimized settings for compatibility
 */

export interface PDFExportOptions {
  filename?: string;
}

function normalizeInlineStyle(styleText: string | null): string {
  if (!styleText) return '';

  return styleText
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .filter((part) => !/(oklch|oklab|lab|lch)\(/i.test(part))
    .join('; ');
}

function sanitizeExportClone(root: HTMLElement, sourceRoot?: HTMLElement): void {
  const cloneElements = [root, ...Array.from(root.querySelectorAll<HTMLElement>('*'))];
  const sourceElements = sourceRoot
    ? [sourceRoot, ...Array.from(sourceRoot.querySelectorAll<HTMLElement>('*'))]
    : [];

  cloneElements.forEach((node, index) => {
    node.removeAttribute('class');

    const sourceNode = sourceElements[index];
    if (sourceNode) {
      const safeInlineStyle = normalizeInlineStyle(sourceNode.getAttribute('style'));
      if (safeInlineStyle) {
        node.setAttribute('style', safeInlineStyle);
      } else {
        node.removeAttribute('style');
      }
    }

    if (!node.style.color) {
      node.style.color = '#0f172a';
    }
    if (!node.style.fontFamily) {
      node.style.fontFamily = 'Arial, sans-serif';
    }
    if (!node.style.backgroundColor && node === root) {
      node.style.backgroundColor = '#ffffff';
    }
    node.style.setProperty('webkit-font-smoothing', 'antialiased');
    node.style.setProperty('-moz-osx-font-smoothing', 'grayscale');
    node.style.setProperty('color-scheme', 'light');
  });
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
  let exportContainer: HTMLDivElement | null = null;

  try {
    // Dynamically import libraries
    const html2canvas = (await import('html2canvas')).default;
    const { jsPDF } = await import('jspdf');

    const filename = options.filename || `rental-agreement-${Date.now()}.pdf`;

    const exportNode = element.cloneNode(true) as HTMLElement;
    sanitizeExportClone(exportNode, element);

    exportContainer = document.createElement('div');
    exportContainer.setAttribute('data-pdf-export-container', 'true');
    exportContainer.style.position = 'fixed';
    exportContainer.style.left = '-100000px';
    exportContainer.style.top = '0';
    exportContainer.style.width = `${Math.max(element.scrollWidth, 900)}px`;
    exportContainer.style.backgroundColor = '#ffffff';
    exportContainer.style.padding = '0';
    exportContainer.style.margin = '0';
    exportContainer.style.zIndex = '-1';
    exportContainer.appendChild(exportNode);
    document.body.appendChild(exportContainer);

    // Wait for rendering
    await new Promise(resolve => setTimeout(resolve, 100));

    // Convert the element to canvas using html2canvas with optimized settings
    const canvasOptions = {
      scale: 2, // High quality
      useCORS: false, // Disable CORS to avoid issues
      allowTaint: true, // Allow tainted canvas
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: exportNode.scrollWidth,
      windowHeight: exportNode.scrollHeight,
      removeContainer: true,
      imageTimeout: 15000,
      foreignObjectRendering: false, // Better compatibility
      onclone: (clonedDoc: Document) => {
        const clonedRoot = clonedDoc.querySelector('[data-pdf-export-container="true"] > *') as HTMLElement | null;
        if (clonedRoot) {
          sanitizeExportClone(clonedRoot, element);
        }
      }
    } as any;
    const canvas = await html2canvas(exportNode, canvasOptions);

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

      // Calculate which part of the image to show
      const sourceY = imgHeightMM - remainingHeight;
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
  } finally {
    if (exportContainer && exportContainer.parentNode) {
      exportContainer.parentNode.removeChild(exportContainer);
    }
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

export function generateInvoicePDFFilename(
  customerName: string,
  invoiceNumber?: string,
  bookingId?: string
): string {
  const sanitizedName = customerName.replace(/[^a-zA-Z0-9]/g, '_');
  const identifier = invoiceNumber || bookingId || Date.now().toString();
  const date = new Date().toISOString().split('T')[0];

  return `Captura_Invoice_${sanitizedName}_${identifier}_${date}.pdf`;
}

/**
 * Print the rental agreement
 */
export function printAgreement(): void {
  window.print();
}

