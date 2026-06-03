export const buildPrompt = (question, chunks) => {
  return `
You are an interview preparation assistant.

Answer only from the provided context.

Context:

${chunks.join("\n\n")}

Question:
${question}

Answer:
`;
};

export const buildResumeAnalysisPrompt = (chunks) => {
  return `
You are a strict resume reviewer.

Use only the provided context.
Return valid JSON only with this exact shape:
{
  "strengths": ["..."],
  "weaknesses": ["..."],
  "improvements": ["..."]
}

Keep each array concise and grounded in the resume.

Context:

${chunks.join("\n\n")}
`;
};

export const buildInterviewQuestionsPrompt = (questionContext, chunks) => {
  return `
You are an interview coach.

Use only the provided resume context.
Return valid JSON only with this exact shape:
{
  "questions": ["...", "...", "..."]
}

Write three concise mock interview questions that are directly grounded in the resume.

Context:

${chunks.join("\n\n")}

Focus:
${questionContext}
`;
};

export const buildAtsScorePrompt = (jobDescription, chunks) => {
  return `
You are an ATS scoring assistant.

Compare the resume context against the job description.
Return valid JSON only with this exact shape:
{
  "score": 82,
  "missingSkills": ["Docker", "AWS"]
}

Rules:
- score must be an integer from 0 to 100.
- missingSkills should be concise and limited to the most relevant gaps.

Resume Context:

${chunks.join("\n\n")}

Job Description:
${jobDescription}
`;
};

export default buildPrompt;
