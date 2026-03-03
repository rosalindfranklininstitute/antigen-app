import {
  getCookie,
  toTitleCase,
  pluralise,
  timeSince,
  validateSeq,
  limitToNDigits,
} from "./utils";

describe("getCookie", () => {
  afterEach(() => {
    Object.defineProperty(document, "cookie", {
      writable: true,
      value: "",
    });
  });

  it("returns null when no cookies exist", () => {
    Object.defineProperty(document, "cookie", {
      writable: true,
      value: "",
    });
    expect(getCookie("csrftoken")).toBeNull();
  });

  it("returns the correct cookie value", () => {
    Object.defineProperty(document, "cookie", {
      writable: true,
      value: "csrftoken=abc123; other=xyz",
    });
    expect(getCookie("csrftoken")).toBe("abc123");
  });

  it("returns null when the named cookie is missing", () => {
    Object.defineProperty(document, "cookie", {
      writable: true,
      value: "other=xyz",
    });
    expect(getCookie("csrftoken")).toBeNull();
  });

  it("decodes URI-encoded values", () => {
    Object.defineProperty(document, "cookie", {
      writable: true,
      value: "token=hello%20world",
    });
    expect(getCookie("token")).toBe("hello world");
  });
});

describe("toTitleCase", () => {
  it("capitalises a single word", () => {
    expect(toTitleCase("hello")).toBe("Hello");
  });

  it("capitalises multiple words", () => {
    expect(toTitleCase("hello world")).toBe("Hello World");
  });

  it("handles already capitalised input", () => {
    expect(toTitleCase("HELLO")).toBe("Hello");
  });

  it("returns empty string for empty input", () => {
    expect(toTitleCase("")).toBe("");
  });
});

describe("pluralise", () => {
  it("adds s to a regular word", () => {
    expect(pluralise("antigen")).toBe("antigens");
  });

  it("changes y to ies", () => {
    expect(pluralise("library")).toBe("libraries");
  });
});

describe("timeSince", () => {
  it("returns seconds for very recent dates", () => {
    const now = new Date();
    expect(timeSince(now)).toMatch(/second/);
  });

  it("returns minutes for dates a few minutes ago", () => {
    const date = new Date(Date.now() - 5 * 60 * 1000);
    expect(timeSince(date)).toBe("5 minutes ago");
  });

  it("returns hours for dates a few hours ago", () => {
    const date = new Date(Date.now() - 3 * 3600 * 1000);
    expect(timeSince(date)).toBe("3 hours ago");
  });

  it("returns days for dates a few days ago", () => {
    const date = new Date(Date.now() - 2 * 86400 * 1000);
    expect(timeSince(date)).toBe("2 days ago");
  });

  it("does not pluralise when interval is 1", () => {
    const date = new Date(Date.now() - 1 * 86400 * 1000 - 1000);
    expect(timeSince(date)).toBe("1 day ago");
  });
});

describe("validateSeq", () => {
  it("returns null for a valid sequence", () => {
    expect(validateSeq("ACDEFGHIKLMNPQRSTVWY", 3)).toBeNull();
  });

  it("rejects sequences shorter than minLength", () => {
    expect(validateSeq("AC", 3)).toMatch(/3 or more/);
  });

  it("rejects sequences with numbers", () => {
    expect(validateSeq("ABC123", 3)).toMatch(/A-Z letters only/);
  });

  it("rejects sequences with special characters", () => {
    expect(validateSeq("ABC-DEF", 3)).toMatch(/A-Z letters only/);
  });

  it("accepts lowercase letters", () => {
    expect(validateSeq("abcdef", 3)).toBeNull();
  });
});

describe("limitToNDigits", () => {
  it("returns undefined for undefined input", () => {
    expect(limitToNDigits(undefined, 4)).toBeUndefined();
  });

  it("returns null for null input", () => {
    expect(limitToNDigits(null, 4)).toBeNull();
  });

  it("returns NaN for a non-numeric string", () => {
    expect(limitToNDigits("abc", 4)).toBeNaN();
  });

  it("uses toFixed when integer digits are fewer than digLimit (1-digit integer)", () => {
    // intDigits=1, digLimit=4 → toFixed(3)
    expect(limitToNDigits(1.23456, 4)).toBe("1.235");
  });

  it("uses toFixed when integer digits are fewer than digLimit (2-digit integer)", () => {
    // intDigits=2, digLimit=4 → toFixed(2)
    expect(limitToNDigits(12.3456, 4)).toBe("12.35");
  });

  it("uses toFixed when integer digits are fewer than digLimit (3-digit integer)", () => {
    // intDigits=3, digLimit=4 → toFixed(1)
    expect(limitToNDigits(123.456, 4)).toBe("123.5");
  });

  it("uses toPrecision when integer digits equal digLimit", () => {
    // intDigits=4, digLimit=4 → toPrecision(4)
    expect(limitToNDigits(1234.56, 4)).toBe("1235");
  });

  it("uses toPrecision (exponential) when integer digits exceed digLimit", () => {
    // intDigits=5, digLimit=4 → toPrecision(4) → exponential notation
    expect(limitToNDigits(12345.6, 4)).toBe("1.235e+4");
  });

  it("pads with trailing zeros when value has fewer decimal places than needed", () => {
    // intDigits=1, digLimit=4 → toFixed(3) → "1.000"
    expect(limitToNDigits(1, 4)).toBe("1.000");
  });

  it("handles zero", () => {
    // intDigits=1 (String(0).length), digLimit=4 → toFixed(3)
    expect(limitToNDigits(0, 4)).toBe("0.000");
  });

  it("handles negative numbers (uses Math.abs for digit count)", () => {
    // intDigits=1, digLimit=4 → toFixed(3)
    expect(limitToNDigits(-1.5, 4)).toBe("-1.500");
  });

  it("handles negative numbers when integer digits equal digLimit", () => {
    // intDigits=4, digLimit=4 → toPrecision(4)
    expect(limitToNDigits(-1234.56, 4)).toBe("-1235");
  });

  it("accepts numeric strings", () => {
    expect(limitToNDigits("1.23456", 4)).toBe("1.235");
  });

  it("works with a digLimit of 2", () => {
    // intDigits=1, digLimit=2 → toFixed(1)
    expect(limitToNDigits(1.23, 2)).toBe("1.2");
  });

  // 0 < n < 1: Math.floor(Math.abs(n)) === 0, so intDigits is always 1,
  // and the path is always toFixed(digLimit - 1).
  it("pads trailing zeros for fractional values less than 1", () => {
    expect(limitToNDigits(0.5, 4)).toBe("0.500");
  });

  it("pads trailing zeros for fractional values with one significant decimal", () => {
    expect(limitToNDigits(0.1, 4)).toBe("0.100");
  });

  it("truncates fractional values that exceed digLimit decimal places", () => {
    expect(limitToNDigits(0.123456, 4)).toBe("0.123");
  });

  it("loses significant digits for very small fractions that underflow the precision", () => {
    // 0.0001 → toFixed(3) → all significant digits fall below the cutoff
    expect(limitToNDigits(0.0001, 4)).toBe("0.000");
  });

  it("rounds up when rounding crosses the integer boundary", () => {
    // 0.9999 → toFixed(3) rounds up to 1.000
    expect(limitToNDigits(0.9999, 4)).toBe("1.000");
  });
});
