/**
 * Detects if the given text is a CSV file exported from DKB.de. They insert a
 * bunch of extra information before the actual CSV data, which makes the file
 * an invalid CSV file unless it's removed.
 *
 * @param text The complete text string with linebreaks to check
 * @returns A boolean indicating whether or not the text is a DKB CSV file
 */
export const isDkb = (text: string): boolean => {
  const lines = text.split("\n");
  const regexp = new RegExp(/"Kontonummer:";"/);
  const matches = regexp.exec(lines[0]);

  return matches !== null;
};

/**
 * Discards the lines with additional info that DKB adds to CSV exports.
 *
 * @param string The complete DKB CSV file as a string
 * @returns A cleaned string without the extra DKB information
 */
export const cleanDkb = (text: string): string => {
  const lines = text.split("\n");
  const wantedLines = lines.slice(6);

  return wantedLines.join("\n");
};
