import React, { useState, useEffect } from "react";
import { useLocalStorage } from "usehooks-ts";
import { Brain, Settings, Menu, PlusCircle } from "lucide-react";
import { WritingPrompt } from "./components/WritingPrompt";
import { SentenceList } from "./components/SentenceList";
import { SettingsModal } from "./components/SettingsModal";
import { Sidebar } from "./components/Sidebar";
import { useOpenAI } from "./hooks/useOpenAI";
import type { WritingState, WritingSession } from "./types";

function App() {
  const { apiKey, setApiKey, generateNextPrompt, isInitialized } = useOpenAI();
  const [sessions, setSessions] = useLocalStorage<WritingSession[]>("writing_sessions", []);
  const [currentSession, setCurrentSession] = useState<string | null>(null);
  const [state, setState] = useState<WritingState>({
    sentences: [],
    paragraphs: [],
    currentPrompt: null,
    isLoading: false,
    apiKey: null,
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (state.sentences.length > 0 || state.paragraphs.length > 0) {
      const sessionId = currentSession || new Date().toISOString();
      const updatedSessions = sessions.filter((s) => s.id !== sessionId);
      updatedSessions.unshift({
        id: sessionId,
        date: sessionId,
        paragraphs: state.paragraphs,
        sentences: state.sentences,
      });
      setSessions(updatedSessions);
      setCurrentSession(sessionId);
    }
  }, [state.sentences, state.paragraphs]);

  const handleSentenceSubmit = async (text: string) => {
    setState((prev) => ({
      ...prev,
      sentences: [...prev.sentences, text],
      isLoading: true,
      currentPrompt: "Analyzing your story's progression...", // Loading state message
    }));

    try {
      const nextPrompt = await generateNextPrompt([...state.sentences, text]);
      setState((prev) => ({
        ...prev,
        currentPrompt: nextPrompt,
        isLoading: false,
      }));
    } catch (error) {
      console.error("Error generating prompt:", error);
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const handleNewParagraph = async () => {
    if (state.sentences.length === 0) return;

    const newParagraph = state.sentences.join(" ");
    const paragraphs = [...state.paragraphs, newParagraph];
    setState((prev) => ({
      ...prev,
      paragraphs,
      sentences: [],
      isLoading: true,
      currentPrompt: "Contemplating the next chapter...", // Loading state message
    }));

    try {
      const nextPrompt = await generateNextPrompt(paragraphs, true);
      setState((prev) => ({
        ...prev,
        currentPrompt: nextPrompt,
        isLoading: false,
      }));
    } catch (error) {
      console.error("Error generating prompt:", error);
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const handleNewStory = () => {
    setCurrentSession(null);
    setState({
      sentences: [],
      paragraphs: [],
      currentPrompt: null,
      isLoading: false,
      apiKey: null,
    });
  };

  const handleSessionSelect = (session: WritingSession) => {
    setCurrentSession(session.id);
    setState((prev) => ({
      ...prev,
      sentences: session.sentences,
      paragraphs: session.paragraphs,
      currentPrompt: null,
    }));
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="fixed top-4 left-4 flex space-x-2 z-50">
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
          title="Settings"
        >
          <Settings size={24} className="text-gray-400" />
        </button>
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
          title="Story History"
        >
          <Menu size={24} className="text-gray-400" />
        </button>
        <button
          onClick={handleNewStory}
          className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
          title="Start New Story"
        >
          <PlusCircle size={24} className="text-gray-400" />
        </button>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <Brain size={48} className="text-blue-500" />
          </div>
          <h1 className="text-5xl font-bold mb-4">Stream your thought</h1>
          <p className="text-xl text-gray-400">A free-writing framework for fiction writers.</p>
        </div>

        {!isInitialized ? (
          <div className="max-w-xl mx-auto">
            <WritingPrompt
              onSubmit={setApiKey}
              placeholder="Enter OpenAI API key"
              isLoading={false}
              isApiKeyInput
            />
          </div>
        ) : (
          <div className="space-y-8">
            {state.paragraphs.length > 0 && (
              <div className="space-y-4">
                {state.paragraphs.map((paragraph, index) => (
                  <p key={index} className="text-white/90 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            )}

            {state.sentences.length > 0 && (
              <div className="bg-gray-800/50 p-6 rounded-xl">
                <SentenceList
                  sentences={state.sentences}
                  currentPrompt={state.currentPrompt}
                  isLoading={state.isLoading}
                />
                <button
                  onClick={handleNewParagraph}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create New Paragraph
                </button>
              </div>
            )}

            <WritingPrompt
              onSubmit={handleSentenceSubmit}
              placeholder="Write your sentence"
              isLoading={state.isLoading}
            />
          </div>
        )}
      </div>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiKey={apiKey}
        onApiKeyChange={setApiKey}
      />

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        sessions={sessions}
        onSessionSelect={handleSessionSelect}
      />
    </div>
  );
}

export default App;
