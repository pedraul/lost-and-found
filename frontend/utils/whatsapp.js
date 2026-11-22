const supportWhatsAppNumber = '250780497307';

export function getWhatsAppChatUrl(message) {
  const text = encodeURIComponent(message);
  return `https://wa.me/${supportWhatsAppNumber}?text=${text}`;
}
