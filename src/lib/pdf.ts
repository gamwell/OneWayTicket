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

  pdf.setFillColor(253, 176, 34);
  pdf.rect(0, 0, pageWidth, 15, 'F');

  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('ONEWAYTICKET', 10, 10);

  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.text(event.titre, 10, 25);

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');

  const eventDate = format(new Date(event.date_debut), "d MMMM yyyy 'à' HH'h'mm", { locale: fr });
  pdf.text(`Date: ${eventDate}`, 10, 33);
  pdf.text(`Lieu: ${event.lieu}, ${event.ville}`, 10, 39);

  pdf.setDrawColor(253, 176, 34);
  pdf.setLineWidth(0.5);
  pdf.line(10, 45, pageWidth - 10, 45);

  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Informations du billet', 10, 53);

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Participant: ${ticket.nom_participant}`, 10, 60);
  pdf.text(`Email: ${ticket.email_participant}`, 10, 66);
  pdf.text(`Code: ${ticket.code_billet}`, 10, 72);
  pdf.text(`Prix: ${ticket.prix_paye.toFixed(2)} €`, 10, 78);

  if (qrCodeDataURL) {
    const qrSize = 40;
    const qrX = pageWidth - qrSize - 10;
    const qrY = 50;
    pdf.addImage(qrCodeDataURL, 'PNG', qrX, qrY, qrSize, qrSize);

    pdf.setFontSize(8);
    pdf.setTextColor(107, 114, 128);
    pdf.text('Scannez ce QR code', qrX, qrY + qrSize + 5, { align: 'center', maxWidth: qrSize });
    pdf.text('à l\'entrée', qrX + qrSize / 2, qrY + qrSize + 9, { align: 'center' });
  }

  pdf.setFontSize(7);
  pdf.setTextColor(107, 114, 128);
  const footer = 'Ce billet est personnel et non transférable. Présentez-le à l\'entrée de l\'événement.';
  pdf.text(footer, pageWidth / 2, pageHeight - 10, { align: 'center', maxWidth: pageWidth - 20 });

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

    pdf.setFillColor(253, 176, 34);
    pdf.rect(0, 0, pageWidth, 15, 'F');

    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('ONEWAYTICKET', 10, 10);

    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text(event.titre, 10, 25);

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');

    const eventDate = format(new Date(event.date_debut), "d MMMM yyyy 'à' HH'h'mm", { locale: fr });
    pdf.text(`Date: ${eventDate}`, 10, 33);
    pdf.text(`Lieu: ${event.lieu}, ${event.ville}`, 10, 39);

    pdf.setDrawColor(253, 176, 34);
    pdf.setLineWidth(0.5);
    pdf.line(10, 45, pageWidth - 10, 45);

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Informations du billet', 10, 53);

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Participant: ${ticket.nom_participant}`, 10, 60);
    pdf.text(`Email: ${ticket.email_participant}`, 10, 66);
    pdf.text(`Code: ${ticket.code_billet}`, 10, 72);
    pdf.text(`Prix: ${ticket.prix_paye.toFixed(2)} €`, 10, 78);
    pdf.text(`Billet ${i + 1}/${ticketsData.length}`, 10, 84);

    if (qrCodeDataURL) {
      const qrSize = 40;
      const qrX = pageWidth - qrSize - 10;
      const qrY = 50;
      pdf.addImage(qrCodeDataURL, 'PNG', qrX, qrY, qrSize, qrSize);

      pdf.setFontSize(8);
      pdf.setTextColor(107, 114, 128);
      pdf.text('Scannez ce QR code', qrX, qrY + qrSize + 5, { align: 'center', maxWidth: qrSize });
      pdf.text('à l\'entrée', qrX + qrSize / 2, qrY + qrSize + 9, { align: 'center' });
    }

    pdf.setFontSize(7);
    pdf.setTextColor(107, 114, 128);
    const footer = 'Ce billet est personnel et non transférable. Présentez-le à l\'entrée de l\'événement.';
    pdf.text(footer, pageWidth / 2, pageHeight - 10, { align: 'center', maxWidth: pageWidth - 20 });
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
