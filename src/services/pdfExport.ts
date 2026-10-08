import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';
import { EXACT_DISCLAIMER } from '../types';

/**
 * Generates and downloads a clean, multi-page professional PDF report.
 * Uses html2canvas-pro for full compatibility with modern CSS color spaces including OKLCH.
 */
export async function generateAndDownloadPdf(
  pageContainerElements: HTMLElement[],
  reportId: string,
  onProgress?: (pct: number) => void
): Promise<void> {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const totalPages = pageContainerElements.length;

  for (let i = 0; i < totalPages; i++) {
    onProgress?.(Math.round(((i + 1) / totalPages) * 90));
    const pageEl = pageContainerElements[i];

    // High quality canvas capture with html2canvas-pro
    const canvas = await html2canvas(pageEl, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#FFFFFF',
      windowWidth: 1200,
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);

    if (i > 0) {
      pdf.addPage('a4', 'portrait');
    }

    // A4 dimensions: 210mm x 297mm
    pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
  }

  onProgress?.(100);
  pdf.save(`NeuroGeneX_Report_${reportId}.pdf`);
}

