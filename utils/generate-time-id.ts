export function generateTimeId(seed: number): string {
  return `${new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\..+/, "")}-${seed}`;
}
