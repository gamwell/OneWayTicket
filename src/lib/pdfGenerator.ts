import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const downloadInvoice = async (elementId: string, fileName: string): Promise<void> => {
  const element = document.getElementById(elementId) as HTMLElement;

  if (!element) {
    console.error("Élément introuvable");
    return;
  }

  const canvas = await html2canvas(element, { scale: 2 });
  const imgData = canvas.toDataURL('image/png');
  
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pdfWidth = pdf.internal.pageSize.getWidth();
  
  // Calcul de la hauteur proportionnelle
  const imgProps = pdf.getImageProperties(imgData);
  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

  pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
  pdf.save(`${fileName}.pdf`);
};