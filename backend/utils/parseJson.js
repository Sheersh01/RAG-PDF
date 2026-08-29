export const parseJsonResponse = (text) => {
  const raw = String(text || "").trim();
  const withoutCodeFences = raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "");
  const start = withoutCodeFences.indexOf("{");
  const end = withoutCodeFences.lastIndexOf("}");

  if (start === -1 || end === -1 || end < start) {
    throw new Error("Model did not return valid JSON");
  }

  return JSON.parse(withoutCodeFences.slice(start, end + 1));
};

export const extractModelContent = (response) => {
  const content = response?.content ?? response ?? "";
  if (typeof content === "string") {
    return content;
  }
  if (Array.isArray(content)) {
    return content
      .map((part) => (typeof part === "string" ? part : part?.text || ""))
      .join("");
  }
  return String(content);
};

export default parseJsonResponse;
