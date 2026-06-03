export const ragAnswerPrompt = (context, question) => `
Context:
${context}

Question:
${question}

Answer:
`;

export const interviewQuestionPrompt = (context) => `
Based on the following resume, job description, and notes, generate three concise mock interview questions.

Context:
${context}
`;
