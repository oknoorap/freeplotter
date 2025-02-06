export interface WritingState {
  sentences: string[];
  paragraphs: string[];
  currentPrompt: string | null;
  isLoading: boolean;
  apiKey: string | null;
}

export interface SuggestionState {
  paragraphIndex: number;
  currentSuggestion?: string;
  isLoading: boolean;
}

export interface OpenAIResponse {
  nextPrompt: string;
}

export interface WritingSession {
  id: string;
  date: string;
  paragraphs: string[];
  sentences: string[];
}

export interface Settings {
  apiKey: string | null;
}