// Helper for future extensibility. Not strictly required for current logic, but useful for future features or testing.
export function daysBetween(date1: Date, date2: Date): number {
  const diff = Math.abs(date1.getTime() - date2.getTime());
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}
