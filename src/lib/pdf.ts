import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Ticket, Event } from '../types/database';

export interface TicketPDFData {
  ticket: Ticket;
  event: Event;
  qrCodeDataURL: string;
}

export const generateTicketPDF = async (data: TicketPDFData): Promise<Blob> => {
  const { ticket, event, qrCodeDataURL } = data;

  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a5',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const gradient1 = { r: 255, g: 107, b: 157 };
  const gradient2 = { r: 0, g: 229, b: 255 };
  const gradient3 = { r: 185, g: 103, b: 255 };

  for (let i = 0; i < pageHeight; i++) {
    const ratio = i / pageHeight;
    const r = Math.round(gradient1.r + (gradient2.r - gradient1.r) * ratio * 0.5 + (gradient3.r - gradient1.r) * ratio * 0.5);
    const g = Math.round(gradient1.g + (gradient2.g - gradient1.g) * ratio * 0.5 + (gradient3.g - gradient1.g) * ratio * 0.5);
    const b = Math.round(gradient1.b + (gradient2.b - gradient1.b) * ratio * 0.5 + (gradient3.b - gradient1.b) * ratio * 0.5);
    pdf.setFillColor(r, g, b);
    pdf.rect(0, i, pageWidth, 1, 'F');
  }

  pdf.setFillColor(255, 255, 255, 0.95);
  pdf.roundedRect(8, 8, pageWidth - 16, pageHeight - 16, 3, 3, 'F');

  pdf.setFillColor(255, 107, 157);
  pdf.roundedRect(12, 12, pageWidth - 24, 20, 2, 2, 'F');

  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text('ONEWAYTICKET', 16, 24);

  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Votre billet numérique', pageWidth - 16, 24, { align: 'right' });

  pdf.setTextColor(31, 41, 55);
  pdf.setFontSize(22);
  pdf.setFont('helvetica', 'bold');
  const titleLines = pdf.splitTextToSize(event.titre, pageWidth - 32);
  pdf.text(titleLines, 16, 42);

  const titleHeight = titleLines.length * 8;

  pdf.setFillColor(249, 250, 251);
  pdf.roundedRect(12, 42 + titleHeight, pageWidth - 24, 28, 2, 2, 'F');

  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(107, 114, 128);
  pdf.text('DATE', 16, 48 + titleHeight);
  pdf.text('LIEU', pageWidth / 2, 48 + titleHeight);

  const eventDate = format(new Date(event.date_debut), "d MMMM yyyy 'à' HH'h'mm", { locale: fr });
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(31, 41, 55);
  pdf.text(eventDate, 16, 56 + titleHeight);
  const lieuText = `${event.lieu}, ${event.ville}`;
  const lieuLines = pdf.splitTextToSize(lieuText, pageWidth / 2 - 20);
  pdf.text(lieuLines, pageWidth / 2, 56 + titleHeight);

  const infoY = 78 + titleHeight;
  pdf.setFillColor(255, 255, 255);
  pdf.roundedRect(12, infoY, pageWidth - 24 - 55, 32, 2, 2, 'F');

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(255, 107, 157);
  pdf.text('INFORMATIONS DU BILLET', 16, infoY + 7);

  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(75, 85, 99);
  pdf.text(`Participant: ${ticket.nom_participant}`, 16, infoY + 14);
  pdf.text(`Email: ${ticket.email_participant}`, 16, infoY + 20);
  pdf.text(`Code: ${ticket.code_billet}`, 16, infoY + 26);

  if (qrCodeDataURL) {
    const qrSize = 45;
    const qrX = pageWidth - 16 - qrSize;
    const qrY = infoY - 5;

    pdf.setFillColor(255, 255, 255);
    pdf.roundedRect(qrX - 3, qrY - 3, qrSize + 6, qrSize + 6, 2, 2, 'F');

    pdf.addImage(qrCodeDataURL, 'PNG', qrX, qrY, qrSize, qrSize);

    pdf.setFontSize(7);
    pdf.setTextColor(107, 114, 128);
    pdf.setFont('helvetica', 'bold');
    pdf.text('SCANNEZ ICI', qrX + qrSize / 2, qrY + qrSize + 7, { align: 'center' });
  }

  pdf.setDrawColor(255, 107, 157);
  pdf.setLineWidth(0.3);
  for (let x = 12; x < pageWidth - 12; x += 3) {
    pdf.line(x, pageHeight - 20, x + 1.5, pageHeight - 20);
  }

  pdf.setFontSize(7);
  pdf.setTextColor(107, 114, 128);
  pdf.setFont('helvetica', 'italic');
  const footer = 'Ce billet est personnel et non transférable. Présentez-le à l\'entrée de l\'événement.';
  pdf.text(footer, pageWidth / 2, pageHeight - 12, { align: 'center', maxWidth: pageWidth - 30 });

  pdf.setFontSize(6);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Powered by OneWayTicket © 2025', pageWidth / 2, pageHeight - 7, { align: 'center' });

  return pdf.output('blob');
};

export const generateMultipleTicketsPDF = async (ticketsData: TicketPDFData[]): Promise<Blob> => {
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a5',
  });

  for (let i = 0; i < ticketsData.length; i++) {
    if (i > 0) {
      pdf.addPage();
    }

    const { ticket, event, qrCodeDataURL } = ticketsData[i];
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const gradient1 = { r: 255, g: 107, b: 157 };
    const gradient2 = { r: 0, g: 229, b: 255 };
    const gradient3 = { r: 185, g: 103, b: 255 };

    for (let j = 0; j < pageHeight; j++) {
      const ratio = j / pageHeight;
      const r = Math.round(gradient1.r + (gradient2.r - gradient1.r) * ratio * 0.5 + (gradient3.r - gradient1.r) * ratio * 0.5);
      const g = Math.round(gradient1.g + (gradient2.g - gradient1.g) * ratio * 0.5 + (gradient3.g - gradient1.g) * ratio * 0.5);
      const b = Math.round(gradient1.b + (gradient2.b - gradient1.b) * ratio * 0.5 + (gradient3.b - gradient1.b) * ratio * 0.5);
      pdf.setFillColor(r, g, b);
      pdf.rect(0, j, pageWidth, 1, 'F');
    }

    pdf.setFillColor(255, 255, 255, 0.95);
    pdf.roundedRect(8, 8, pageWidth - 16, pageHeight - 16, 3, 3, 'F');

    pdf.setFillColor(255, 107, 157);
    pdf.roundedRect(12, 12, pageWidth - 24, 20, 2, 2, 'F');

    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text('ONEWAYTICKET', 16, 24);

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Billet ${i + 1}/${ticketsData.length}`, pageWidth - 16, 24, { align: 'right' });

    pdf.setTextColor(31, 41, 55);
    pdf.setFontSize(22);
    pdf.setFont('helvetica', 'bold');
    const titleLines = pdf.splitTextToSize(event.titre, pageWidth - 32);
    pdf.text(titleLines, 16, 42);

    const titleHeight = titleLines.length * 8;

    pdf.setFillColor(249, 250, 251);
    pdf.roundedRect(12, 42 + titleHeight, pageWidth - 24, 28, 2, 2, 'F');

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(107, 114, 128);
    pdf.text('DATE', 16, 48 + titleHeight);
    pdf.text('LIEU', pageWidth / 2, 48 + titleHeight);

    const eventDate = format(new Date(event.date_debut), "d MMMM yyyy 'à' HH'h'mm", { locale: fr });
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(31, 41, 55);
    pdf.text(eventDate, 16, 56 + titleHeight);
    const lieuText = `${event.lieu}, ${event.ville}`;
    const lieuLines = pdf.splitTextToSize(lieuText, pageWidth / 2 - 20);
    pdf.text(lieuLines, pageWidth / 2, 56 + titleHeight);

    const infoY = 78 + titleHeight;
    pdf.setFillColor(255, 255, 255);
    pdf.roundedRect(12, infoY, pageWidth - 24 - 55, 32, 2, 2, 'F');

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(255, 107, 157);
    pdf.text('INFORMATIONS DU BILLET', 16, infoY + 7);

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(75, 85, 99);
    pdf.text(`Participant: ${ticket.nom_participant}`, 16, infoY + 14);
    pdf.text(`Email: ${ticket.email_participant}`, 16, infoY + 20);
    pdf.text(`Code: ${ticket.code_billet}`, 16, infoY + 26);

    if (qrCodeDataURL) {
      const qrSize = 45;
      const qrX = pageWidth - 16 - qrSize;
      const qrY = infoY - 5;

      pdf.setFillColor(255, 255, 255);
      pdf.roundedRect(qrX - 3, qrY - 3, qrSize + 6, qrSize + 6, 2, 2, 'F');

      pdf.addImage(qrCodeDataURL, 'PNG', qrX, qrY, qrSize, qrSize);

      pdf.setFontSize(7);
      pdf.setTextColor(107, 114, 128);
      pdf.setFont('helvetica', 'bold');
      pdf.text('SCANNEZ ICI', qrX + qrSize / 2, qrY + qrSize + 7, { align: 'center' });
    }

    pdf.setDrawColor(255, 107, 157);
    pdf.setLineWidth(0.3);
    for (let x = 12; x < pageWidth - 12; x += 3) {
      pdf.line(x, pageHeight - 20, x + 1.5, pageHeight - 20);
    }

    pdf.setFontSize(7);
    pdf.setTextColor(107, 114, 128);
    pdf.setFont('helvetica', 'italic');
    const footer = 'Ce billet est personnel et non transférable. Présentez-le à l\'entrée de l\'événement.';
    pdf.text(footer, pageWidth / 2, pageHeight - 12, { align: 'center', maxWidth: pageWidth - 30 });

    pdf.setFontSize(6);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Powered by OneWayTicket © 2025', pageWidth / 2, pageHeight - 7, { align: 'center' });
  }

  return pdf.output('blob');
};

export const downloadPDF = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
