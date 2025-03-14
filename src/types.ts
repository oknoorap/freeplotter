export interface WritingState {
  sentences: string[];
  paragraphs: string[];
  currentPrompt: string | null;
  isLoading: boolean;
}

export interface SuggestionState {
  paragraphIndex: number;
  currentSuggestion?: string;
  isLoading: boolean;
}

export interface OpenAIResponse {
  nextPrompt: string;
}

export interface StoryItem {
  id: string;
  date: string;
  title: string;
  context: string;
  paragraph: string;
}

export interface Settings {
  apiKey: string | null;
}
