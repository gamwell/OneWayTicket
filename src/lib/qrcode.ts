import QRCode from 'qrcode';

export const generateTicketCode = (): string => {
  const part1 = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  const part2 = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `OWT-${part1}-${part2}`;
};

export const validateTicketCode = (code: string): boolean => {
  const pattern = /^OWT-\d{4}-\d{4}$/;
  return pattern.test(code);
};

export const generateQRCode = async (data: string): Promise<string> => {
  try {
    const qrCodeDataURL = await QRCode.toDataURL(data, {
      width: 300,
      margin: 2,
      color: {
        dark: '#1F2937',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'H',
    });
    return qrCodeDataURL;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
};

export const generateQRCodeBuffer = async (data: string): Promise<Buffer> => {
  try {
    const buffer = await QRCode.toBuffer(data, {
      width: 300,
      margin: 2,
      errorCorrectionLevel: 'H',
    });
    return buffer;
  } catch (error) {
    console.error('Error generating QR code buffer:', error);
    throw new Error('Failed to generate QR code buffer');
  }
};
