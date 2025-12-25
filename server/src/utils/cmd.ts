type ParsedArgs = {
  _: string[];
  [key: string]: any;
};

export function parseArgs(args: string[]): ParsedArgs {
  const result: ParsedArgs = { _: [] };

  for (let i = 0; i < args.length; i++) {
    const a = args[i];

    if (!a) continue;

    if (a.startsWith("--")) {
      const key = a.slice(2);
      const nextArg = args[i + 1];

      if (nextArg && !nextArg.startsWith("-")) {
        result[key] = parseVal(nextArg);
        i++;
      } else {
        result[key] = true;
      }
    } else {
      result._.push(a);
    }
  }

  return result;
}

function parseVal(value: string): string | number | boolean {
  if (!isNaN(Number(value)) && value !== "") {
    return Number(value);
  }

  if (value === "true") return true;
  if (value === "false") return false;

  return value;
}
