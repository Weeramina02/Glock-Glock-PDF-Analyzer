import { GoogleGenAI } from "@google/genai";
import type { AnalysisResult, ApiImage, WebReference } from '../types';
import type { Part, GroundingChunk } from '@google/genai';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const parseQuestions = (questionsBlock: string): string[] => {
    if (!questionsBlock) return [];
    // Split by a newline followed by a number and a dot.
    // This assumes each question starts on a new line with "1.", "2.", etc.
    return questionsBlock.split(/\n(?=\s*\d+\.\s)/)
      .map(q => q.trim())
      .filter(q => q.length > 0);
};


const parseAnalysisResponse = (responseText: string): { summary: string; questions: string[] } => {
  const summaryMatch = responseText.match(/### SUMMARY ###\s*([\s\S]*?)\s*### QUESTIONS ###/);
  const questionsMatch = responseText.match(/### QUESTIONS ###\s*([\s\S]*)/);

  const summary = summaryMatch ? summaryMatch[1].trim() : 'Could not parse summary.';
  
  let questions: string[] = [];
  if (questionsMatch) {
    const questionsBlock = questionsMatch[1].trim();
    questions = parseQuestions(questionsBlock);
  }

  if (!summaryMatch && !questionsMatch) {
      // Fallback if delimiters are not found
      return { summary: responseText, questions: [] };
  }
  
  return { summary, questions };
};


export const analyzeContent = async (text: string, images: ApiImage[]): Promise<AnalysisResult> => {
  const model = 'gemini-2.5-flash';
  
  const prompt = `
You are an expert EASA Part-66 B2 instructor and examiner. I will provide you with content from training material, which may include text and images. Your task is to generate a structured summary and high-quality Multiple Choice Questions (MCQs) directly from the provided content.

You MUST use your web search tool to find related content, verify information, and provide context for your analysis.

First, create the summary following these rules:
--- SUMMARY RULES ---
1.  **Use Only Provided Words**: Use exact words and terminology from the provided text. Do not paraphrase or add external information.
2.  **Structure and Formatting**: Use **bolded headings** for main topics. Use bullet points for lists and key details under each heading. Keep the information in the order it appears in the text.
3.  **Accuracy**: The summary must be a direct and faithful representation of the provided text.

After the summary, create the Multiple Choice Questions following these rules:
--- MCQ RULES ---
1.  **Levels**: Generate questions at three levels according to EASA B2 standards: Level 1 (Recall), Level 2 (Understanding), and Level 3 (Application/Evaluation).
2.  **Format**: Each question must have 3 options only (A, B, C). Only one answer is correct. The other two must be plausible distractors.
3.  **Wording**: Use exact wording/phrases from the provided content. Do not use external sources for questions.
4.  **Answer & Explanation**: Include the correct answer and a short explanation referencing the relevant section of the content.
5.  **Organization**: Group questions by submodule if identifiable from the text.

--- OUTPUT STRUCTURE ---
Structure your response EXACTLY as follows, using the specified delimiters. Do not add any other formatting or explanations.

### SUMMARY ###
[Your structured summary here, following the summary rules]

### QUESTIONS ###
[Your list of MCQs here, following the MCQ rules, numbered sequentially]
1. Question text from provided content?
   A) Option 1
   B) Option 2
   C) Option 3
   Answer: B
   Explanation: According to [content section], ...
2. Another question?
   A) Option 1
   B) Option 2
   C) Option 3
   Answer: C
   Explanation: Based on the scenario described in [content section], ...
`;

  const contentParts: Part[] = [];

  if (text) {
    contentParts.push({ text });
  }

  images.forEach(image => {
    contentParts.push({
      inlineData: {
        mimeType: image.mimeType,
        data: image.data,
      },
    });
  });
  
  contentParts.push({ text: prompt });

  try {
    const response = await ai.models.generateContent({
        model,
        contents: { parts: contentParts },
        config: {
            tools: [{ googleSearch: {} }],
        },
    });

    const responseText = response.text;
    
    if (!responseText) {
      let errorMessage = "AI service returned an empty response.";
      if (response.candidates && response.candidates.length > 0) {
        const candidate = response.candidates[0];
        if (candidate.finishReason === 'SAFETY') {
          errorMessage = "The request was blocked due to safety settings. Please check the content for any sensitive material.";
        } else if (candidate.finishReason) {
          errorMessage = `Analysis stopped unexpectedly. Reason: ${candidate.finishReason}.`;
        }
      }
      console.error("Gemini API response is empty or invalid.", response);
      throw new Error(errorMessage);
    }
    
    const { summary, questions } = parseAnalysisResponse(responseText);

    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    const references: WebReference[] = groundingMetadata?.groundingChunks
        ?.map((chunk: GroundingChunk) => chunk.web)
        .filter((web): web is { uri: string; title: string } => !!web?.uri)
        .reduce((acc: WebReference[], current) => {
            if (!acc.some(item => item.uri === current.uri)) {
                acc.push(current);
            }
            return acc;
        }, []) || [];


    return { summary, questions, references };
  } catch (error) {
    console.error("Gemini API call failed:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to get analysis from AI service.");
  }
};

export const generateMoreQuestions = async (text: string, images: ApiImage[], existingQuestions: string[]): Promise<string[]> => {
  const model = 'gemini-2.5-flash';

  const prompt = `
You are an expert EASA Part-66 B2 examiner. Based on the provided content (text and images), generate 5 MORE unique Multiple Choice Questions (MCQs).

DO NOT repeat questions from this list of existing questions:
--- EXISTING QUESTIONS ---
${existingQuestions.join('\n\n')}
---

Follow these rules for the new questions:
--- MCQ RULES ---
1.  **Levels**: Generate questions at three levels according to EASA B2 standards: Level 1 (Recall), Level 2 (Understanding), and Level 3 (Application/Evaluation).
2.  **Format**: Each question must have 3 options only (A, B, C). Only one answer is correct. The other two must be plausible distractors.
3.  **Wording**: Use exact wording/phrases from the provided content. Do not use external sources for questions.
4.  **Answer & Explanation**: Include the correct answer and a short explanation referencing the relevant section of the content.
5.  **Organization**: Group questions by submodule if identifiable from the text.

--- OUTPUT STRUCTURE ---
Output ONLY the new questions, numbered sequentially starting from 1. Do not include any other delimiters or headings like "### QUESTIONS ###".
1. New question text?
   A) Option A
   B) Option B
   C) Option C
   Answer: A
   Explanation: ...
2. Another new question?
   A) Option 1
   B) Option 2
   C) Option 3
   Answer: C
   Explanation: ...
`;

  const contentParts: Part[] = [];

  if (text) {
    contentParts.push({ text });
  }

  images.forEach(image => {
    contentParts.push({
      inlineData: {
        mimeType: image.mimeType,
        data: image.data,
      },
    });
  });
  
  contentParts.push({ text: prompt });

  try {
    const response = await ai.models.generateContent({
        model,
        contents: { parts: contentParts },
    });

    const responseText = response.text;
    if (!responseText) {
        let errorMessage = "AI service returned an empty response while generating more questions.";
        if (response.candidates && response.candidates.length > 0) {
            const candidate = response.candidates[0];
            if (candidate.finishReason === 'SAFETY') {
                errorMessage = "The request for more questions was blocked due to safety settings.";
            } else if (candidate.finishReason) {
                errorMessage = `Generation stopped unexpectedly. Reason: ${candidate.finishReason}.`;
            }
        }
        console.error("Gemini API response is empty or invalid for more questions.", response);
        throw new Error(errorMessage);
    }
    return parseQuestions(responseText);
  } catch (error) {
    console.error("Gemini API call failed for more questions:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to generate more questions from AI service.");
  }
};