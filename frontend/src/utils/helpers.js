// small helpers used across UI

export function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString();
}
// export function truncateText(text, maxLength) {
//   if (text.length <= maxLength) return text;
//   return text.slice(0, maxLength) + '...';
// }