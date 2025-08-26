
export interface WebReference {
  uri: string;
  title: string;
}

export interface AnalysisResult {
  summary: string;
  questions: string[];
  references: WebReference[];
}

export interface ApiImage {
  mimeType: string;
  data: string; // base64 encoded string
}
