import { parse } from "csv-parse/sync";
import { readFileSync } from "fs";

export function readDataRecordsFromFile<T>(
  filePath: string,
  delimiter = ",",
  skipHeader = true
): T[] {
  const data = parse(readFileSync(filePath, "utf-8"), {
    columns: true,
    delimiter,
    skip_empty_lines: true,
  });

  // return skipHeader ? data.slice(1) : data;
  return data;
}
