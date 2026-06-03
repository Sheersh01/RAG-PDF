import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

export const parseSections = (text) => {
  const sections = [];
  const headerMatches = [];

  const headers = [
    { name: "Experience", pattern: /(?:^|\n)[ \t]*(?:WORK\s+EXPERIENCE|PROFESSIONAL\s+EXPERIENCE|EXPERIENCE|EMPLOYMENT\s+HISTORY|EMPLOYMENT)[ \t]*(?:\r?\n|$)/i },
    { name: "Projects", pattern: /(?:^|\n)[ \t]*(?:PERSONAL\s+PROJECTS|ACADEMIC\s+PROJECTS|TECHNICAL\s+PROJECTS|PROJECTS)[ \t]*(?:\r?\n|$)/i },
    { name: "Skills", pattern: /(?:^|\n)[ \t]*(?:TECHNICAL\s+SKILLS|CORE\s+SKILLS|SKILLS|AREAS\s+OF\s+EXPERTISE|KEY\s+SKILLS)[ \t]*(?:\r?\n|$)/i },
    { name: "Education", pattern: /(?:^|\n)[ \t]*(?:EDUCATION|ACADEMICS|ACADEMIC\s+BACKGROUND|ACADEMIC\s+HISTORY)[ \t]*(?:\r?\n|$)/i },
    { name: "Achievements", pattern: /(?:^|\n)[ \t]*(?:ACHIEVEMENTS|AWARDS|HONORS\s*(?:&\s*AWARDS)?)[ \t]*(?:\r?\n|$)/i },
    { name: "Certifications", pattern: /(?:^|\n)[ \t]*(?:CERTIFICATIONS|LICENSES\s*(?:&\s*CERTIFICATIONS)?)[ \t]*(?:\r?\n|$)/i },
  ];

  headers.forEach(({ name, pattern }) => {
    const globalPattern = new RegExp(pattern.source, pattern.flags + 'g');
    let match;
    while ((match = globalPattern.exec(text)) !== null) {
      headerMatches.push({
        name,
        index: match.index,
        length: match[0].length,
      });
    }
  });

  headerMatches.sort((a, b) => a.index - b.index);

  if (headerMatches.length === 0) {
    sections.push({
      name: "General",
      content: text,
    });
    return sections;
  }

  for (let i = 0; i < headerMatches.length; i++) {
    const current = headerMatches[i];
    const next = headerMatches[i + 1];
    
    const contentStart = current.index + current.length;
    const contentEnd = next ? next.index : text.length;
    
    sections.push({
      name: current.name,
      content: text.substring(contentStart, contentEnd).trim(),
    });
  }

  if (headerMatches[0].index > 0) {
    const introText = text.substring(0, headerMatches[0].index).trim();
    if (introText) {
      sections.unshift({
        name: "General",
        content: introText,
      });
    }
  }

  return sections;
};

export const splitTextIntoResumeChunks = async (text) => {
  const sections = parseSections(text);
  const finalChunks = [];

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 400,
    chunkOverlap: 80,
  });

  for (const sec of sections) {
    // Split section content by double newlines to find item boundaries (e.g. distinct companies or projects)
    const items = sec.content.split(/\n\s*\n+/);

    for (const item of items) {
      const trimmedItem = item.trim();
      if (!trimmedItem) continue;

      // Extract title: first line of the item, stripped of bullets/numbers
      const firstLine = trimmedItem.split('\n')[0].trim();
      const title = firstLine.replace(/^[\s*•\-#\s]+/, '').substring(0, 80);

      // If the item itself is relatively short, keep it as a single chunk
      if (trimmedItem.length <= 500) {
        // Prepend contextual information for better vector search representation
        const enrichedContent = `Section: ${sec.name}\nTitle: ${title}\n\n${trimmedItem}`;
        finalChunks.push({
          content: trimmedItem,
          enrichedContent,
          section: sec.name,
          title: title,
        });
      } else {
        // Otherwise split it using RecursiveCharacterTextSplitter
        const subDocs = await splitter.createDocuments([trimmedItem]);
        for (const subDoc of subDocs) {
          const enrichedContent = `Section: ${sec.name}\nTitle: ${title}\n\n${subDoc.pageContent}`;
          finalChunks.push({
            content: subDoc.pageContent,
            enrichedContent,
            section: sec.name,
            title: title,
          });
        }
      }
    }
  }

  return finalChunks;
};

// Keep splitText for backward compatibility
export const splitText = async (text) => {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 100,
  });
  return await splitter.createDocuments([text]);
};
