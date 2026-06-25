export function stableNumber(seedText, min, max) {
  const seed = String(seedText)
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);

  return min + (seed % (max - min + 1));
}

export function getAutoTicketingPrices(club) {
  const slug = club?.slug || club?.id || club?.name || 'club';

  return {
    ticket: stableNumber(`${slug}-ticket`, 25, 80),
    subscription: stableNumber(`${slug}-subscription`, 180, 650)
  };
}