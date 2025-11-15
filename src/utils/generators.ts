export const generateId = (): string => Math.random().toString(36).substr(2, 9);

export const generateQRCode = (url: string): string => {
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
    url
  )}`;
};
