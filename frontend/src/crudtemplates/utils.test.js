import {
  getCookie,
  toTitleCase,
  pluralise,
  timeSince,
  validateSeq,
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
