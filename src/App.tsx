import { useState, useEffect } from "react";
import { useLocalStorage } from "usehooks-ts";
import { Brain, Settings, Menu, PlusCircle, Edit2, Check, X as XIcon, Sparkles, MessageSquare, Loader  } from "lucide-react";
import { WritingPrompt } from "./components/WritingPrompt";
import { SentenceList } from "./components/SentenceList";
import { SettingsModal } from "./components/SettingsModal";
import { Sidebar } from "./components/Sidebar";
import { useOpenAI } from "./hooks/useOpenAI";
import type { WritingState, WritingSession, SuggestionState } from "./types";

function App() {
  const { apiKey, setApiKey, getSuggestion, getShowDontTell, isInitialized } = useOpenAI();
  const [sessions, setSessions] = useLocalStorage<WritingSession[]>("writing_sessions", []);
  const [currentSession, setCurrentSession] = useState<string | null>(null);
  const [editingParagraphIndex, setEditingParagraphIndex] = useState<number | null>(null);
  const [editingParagraphText, setEditingParagraphText] = useState("");
  const [state, setState] = useState<WritingState>({
    sentences: [],
    paragraphs: [],
    currentPrompt: null,
    isLoading: false,
    apiKey: null,
  });
  const [paragraphState, setParagraphState] = useState<SuggestionState>({
    paragraphIndex: 0,
    isLoading: false
  })
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
    const sentences = [...state.sentences, text];
    setState((prev) => ({
      ...prev,
      sentences,
      isLoading: true,
      currentPrompt: "Analyzing your story's progression...",
    }));

    try {
      const nextPrompt = await getSuggestion(sentences, state.paragraphs.join('\n'));
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
      currentPrompt: "Contemplating the next chapter...",
    }));

    try {
      const nextPrompt = await getSuggestion([newParagraph], state.paragraphs.join('\n'), true);
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

  const handleEditParagraph = (index: number) => {
    setEditingParagraphIndex(index);
    setEditingParagraphText(state.paragraphs[index]);
  };

  const handleGetSuggestion = async (index: number) => {
    setParagraphState((prev) => ({
      ...prev,
      paragraphIndex: index,
      currentSuggestion: "Thinking possibilities of \"Show Don't Tell\" suggestion...",
      isLoading: true,
    }));

    try {
      const previousParagraph = [...state.paragraphs].splice(0, index);
      const suggestion = await getShowDontTell(state.paragraphs[index], previousParagraph.join('\n'));
      setParagraphState((prev) => ({
        ...prev,
        currentSuggestion: suggestion,
        isLoading: false,
      }));
    } catch (error) {
      console.error("Error generating prompt:", error);
      setParagraphState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const handleDismissSuggestion = () => {
    setParagraphState({
      isLoading: false,
      paragraphIndex: 0,
      currentSuggestion: undefined
    })
  };

  const handleSaveParagraph = async () => {
    if (editingParagraphIndex === null) return;

    const updatedParagraphs = [...state.paragraphs];
    updatedParagraphs[editingParagraphIndex] = editingParagraphText;

    setState((prev) => ({
      ...prev,
      paragraphs: updatedParagraphs,
      currentPrompt: "Analyzing the revised paragraph...",
    }));

    setEditingParagraphIndex(null);
    setEditingParagraphText("");
  };


  const handleCancelEdit = () => {
    setEditingParagraphIndex(null);
    setEditingParagraphText("");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-stone-300">
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
              <div className="space-y-8">
                {state.paragraphs.map((paragraph, index) => (
                  <div key={index} className="group relative">
                    {editingParagraphIndex === index ? (
                      <div className="space-y-2">
                        <textarea
                          value={editingParagraphText}
                          onChange={(e) => setEditingParagraphText(e.target.value)}
                          className="w-full p-4 bg-gray-800 border border-gray-700 rounded-lg text-stone-300 text-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={Math.max(3, editingParagraphText.split('\n').length)}
                          // @ts-ignore
                          style={{fieldSizing: 'content' }}
                        />
                        <div className="flex space-x-2">
                          <button
                            onClick={handleSaveParagraph}
                            className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-1"
                          >
                            <Check size={16} />
                            <span>Save</span>
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-1"
                          >
                            <XIcon size={16} />
                            <span>Cancel</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="relative">
                        <p className="text-white/85 leading-relaxed pr-10 font-serif text-xl" dangerouslySetInnerHTML={{__html: paragraph.replace(/\n/g, "<br />") }} />
                        <button
                          disabled={paragraphState.isLoading}
                          onClick={() => handleEditParagraph(index)}
                          className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-20"
                          title="Edit paragraph"
                        >
                          <Edit2 size={20} className="text-blue-400 hover:text-blue-300" />
                        </button>
                        {!paragraphState.currentSuggestion && (<button
                          disabled={paragraphState.isLoading}
                          onClick={() => handleGetSuggestion(index)}
                          className="absolute top-10 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacit disabled:opacity-20"
                          title="Get suggestion"
                        >
                          {paragraphState.isLoading ? <Loader size={20} className="text-green-500 animate-spin" /> :
                          <Sparkles size={20} className="text-blue-400 hover:text-blue-300" />}
                        </button>)}
                      </div>
                    )}

                    {paragraphState.paragraphIndex === index && !!paragraphState.currentSuggestion && (
                      <div className="my-2 py-2 px-4 flex flex-col gap-4">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-1">
                            {paragraphState.isLoading ? (
                              <Loader size={20} className="text-green-500 animate-spin" />
                            ) : (
                              <MessageSquare size={20} className="text-green-500" />
                            )}
                          </div>
                          <p className="text-green-400 select-none pointer-events-none"  dangerouslySetInnerHTML={{__html: paragraphState.currentSuggestion.replace(/\n/g, "<br />") }} />
                        </div>
                        {!paragraphState.isLoading && (
                          <div className="ml-8">
                            <button
                              onClick={handleDismissSuggestion}
                              className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-1"
                            >
                              <Check size={16} />
                              <span>OK</span>
                            </button>
                            </div>
                          )}
                      </div>
                    )}
                  </div>
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
        currentSessionId={currentSession}
      />
    </div>
  );
}

export default App;