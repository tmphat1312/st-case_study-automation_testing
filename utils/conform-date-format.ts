export function conformDateFormat(date: string): string {
  const [month, day, year] = date.split("/");
  return `${year}-${month}-${day}`;
}
