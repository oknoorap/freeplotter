import { Check, Edit2, Loader, MessageSquare, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { ulid } from "ulid";
import { useBoolean } from "usehooks-ts";
import { ConfirmModal } from "../components/ConfirmModal";
import { HeaderTitle } from "../components/HeaderTitle";
import { LicenseKeyInput } from "../components/LicenseKeyInput";
import { NavigationLeftMenus } from "../components/NavigationLeftMenus";
import { NavigationRightMenus } from "../components/NavigationRightMenus";
import { ParagraphEditor } from "../components/ParagraphEditor";
import { SentenceList } from "../components/SentenceList";
import { SettingsModal } from "../components/SettingsModal";
import { Sidebar } from "../components/Sidebar";
import { WritingPrompt } from "../components/WritingPrompt";
import {
  useCheckLicense,
  useCreateNewStory,
  useGetQuestion,
  useGetShowing,
} from "../hooks/useAPI";
import { useLicenseKey } from "../hooks/useLicenseKey";
import { useStoryDb } from "../hooks/useStoryDb";
import { Container } from "../layouts/container";
import { DefaultLayout } from "../layouts/default";
import type { StoryItem, SuggestionState, WritingState } from "../types";
import { transformToNewLine } from "../utils/string";

function HomePage() {
  const {
    value: isSettingsOpen,
    setTrue: handleOpenSetttings,
    setFalse: handleCloseSettings,
  } = useBoolean();

  const {
    value: isSidebarOpen,
    setTrue: handleOpenSidebar,
    setFalse: handleCloseSidebar,
  } = useBoolean();

  const {
    value: isInvalidLicenseModalOpen,
    setTrue: handleOpenInvalidLicenseModal,
    setFalse: handleCloseInvalidLicenseModal,
  } = useBoolean();

  const {
    value: isErrorModalOpen,
    setTrue: handleOpenErrorModal,
    setFalse: handleCloseErrorModal,
  } = useBoolean();

  const {
    value: isNewStoryWarningModalOpen,
    setTrue: handleOpenNewStoryWarningModal,
    setFalse: handleCloseNewStoryWarningModal,
  } = useBoolean();

  const { licenseKey, hasLicenseKey } = useLicenseKey();

  const {
    isLoading: isCheckingLicenseKey,
    checkLicenseKey,
    clearEnteredLicenseKey,
  } = useCheckLicense({
    onInvalid: handleOpenInvalidLicenseModal,
  });

  const getQuestion = useGetQuestion();
  const getShowDontTell = useGetShowing();

  const { getStories, getStory, updateStory } = useStoryDb();
  const [storyList, setStoryList] = useState<StoryItem[]>([]);
  const [selectedStoryId, setSelectedStoryId] = useState<string>("");

  const [editingParagraphIndex, setEditingParagraphIndex] = useState<
    number | null
  >(null);
  const [editingParagraphText, setEditingParagraphText] = useState("");
  const [state, setState] = useState<WritingState>({
    date: new Date().toISOString(),
    sentences: [],
    paragraphs: [],
    currentPrompt: null,
    isLoading: false,
  });
  const [paragraphState, setParagraphState] = useState<SuggestionState>({
    paragraphIndex: 0,
    isLoading: false,
  });

  const handleSentenceSubmit = async (sentence: string) => {
    setState((prev) => ({
      ...prev,
      sentences: [...state.sentences, sentence],
      isLoading: true,
      currentPrompt: "Analyzing your story's progression...",
    }));
    try {
      const { question } = await getQuestion.mutateAsync({
        sentences: sentence,
        paragraph: state.sentences.join(" "),
      });

      setState((prev) => ({
        ...prev,
        currentPrompt:
          question ??
          `There's an error while generating question, please contact support.`,
        isLoading: false,
      }));
    } catch (error) {
      const _error = error as Error & { cause: string };
      dispatchErrorModal(_error?.cause ?? _error.message ?? "Unknown error");
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const createNewStory = useCreateNewStory();

  const handleNewParagraph = async () => {
    if (state.sentences.length === 0) return;

    try {
      await createNewStory.mutateAsync({ isParagraph: true });
      const newParagraph = state.sentences.join(" ");
      const paragraphs = [...state.paragraphs, newParagraph];
      setState((prev) => ({
        ...prev,
        paragraphs,
        sentences: [],
        isLoading: false,
      }));
    } catch (error) {
      const _error = error as Error & { cause: string };
      dispatchErrorModal(_error?.cause ?? _error.message ?? "Unknown error");
    }
  };

  const [errorMessage, setErrorMessage] = useState("");
  const dispatchErrorModal = (errorMessage?: string) => {
    setErrorMessage(errorMessage ?? "Unknown error, please contact support.");
    handleOpenErrorModal();
  };

  const handleResetNewStoryState = () => {
    const newStoryId = ulid();
    setSelectedStoryId(newStoryId);
    setState({
      date: new Date().toISOString(),
      sentences: [],
      paragraphs: [],
      currentPrompt: null,
      isLoading: false,
    });
    setParagraphState({
      paragraphIndex: 0,
      isLoading: false,
      currentSuggestion: undefined,
    });
    handleCloseNewStoryWarningModal();
  };

  const handleConsumeNewStoryQuota = async () => {
    try {
      await createNewStory.mutateAsync();
      handleResetNewStoryState();
      const storyId = ulid();
      updateStory(storyId, {
        id: storyId,
        title: "",
        context: "",
        date: new Date().toISOString(),
        paragraphs: [],
        sentences: [],
      });
    } catch (error) {
      const _error = error as Error & { cause: string };
      dispatchErrorModal(_error?.cause ?? _error.message ?? "Unknown error");
    }
  };

  const handleNewStory = async () => {
    if (state.paragraphs.length > 0) return handleOpenNewStoryWarningModal();
    handleResetNewStoryState();
  };

  const handleSelectStory = async (story: StoryItem) => {
    const selectedStory = await getStory(story.id);
    if (!selectedStory) return;
    setSelectedStoryId(selectedStory.id);
    setState((prev) => ({
      ...prev,
      sentences: selectedStory.sentences,
      paragraphs: selectedStory.paragraphs,
      currentPrompt: null,
    }));
    setParagraphState((prev) => ({
      ...prev,
      currentSuggestion: undefined,
    }));
    handleCloseSidebar();
  };

  const handleEditParagraph = (index: number) => {
    setEditingParagraphIndex(index);
    setEditingParagraphText(state.paragraphs[index]);
  };

  const handleGetSuggestion = async (index: number) => {
    setParagraphState((prev) => ({
      ...prev,
      paragraphIndex: index,
      currentSuggestion:
        'Thinking possibilities of "Show Don\'t Tell" suggestion...',
      isLoading: true,
    }));
    try {
      const previousParagraph = [...state.paragraphs].splice(0, index);
      const { story } = await getShowDontTell.mutateAsync({
        paragraph: state.paragraphs[index],
        prevParagraph: previousParagraph.join("\n"),
      });
      setParagraphState((prev) => ({
        ...prev,
        currentSuggestion: story,
        isLoading: false,
      }));
    } catch (error) {
      const _error = error as Error & { cause: string };
      dispatchErrorModal(_error?.cause ?? _error.message ?? "Unknown error");
      setParagraphState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const handleDismissSuggestion = () => {
    setParagraphState({
      isLoading: false,
      paragraphIndex: 0,
      currentSuggestion: undefined,
    });
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

  const handleCheckLicenseValidity = async (licenseKey: string) => {
    try {
      await checkLicenseKey(licenseKey);
    } catch (error) {
      const _error = error as Error & { cause: string };
      dispatchErrorModal(_error?.cause ?? _error.message ?? "Unknown error");
      // console.error("Error checking license key:", error);
    }
  };

  const handleCloseInvalidLicenseKeyModal = () => {
    handleCloseInvalidLicenseModal();
    clearEnteredLicenseKey();
  };

  useEffect(() => {
    if (hasLicenseKey) checkLicenseKey(licenseKey);
  }, [hasLicenseKey, licenseKey]);

  useEffect(() => {
    if (state.sentences.length > 0 || state.paragraphs.length > 0) {
      const storyId = selectedStoryId ?? ulid();
      const date = new Date().toISOString();
      updateStory(storyId, {
        id: storyId,
        title: "",
        context: "",
        date: state.date,
        paragraphs: state.paragraphs,
        sentences: state.sentences,
      });
      setSelectedStoryId(storyId);
      setStoryList((prev) => {
        const storyIndex = prev.findIndex((story) => story.id === storyId);
        if (storyIndex === -1) {
          return [
            {
              id: storyId,
              date,
              title: "",
              context: "",
              paragraph: state.paragraphs?.[0] ?? state.sentences.join(" "),
            },
            ...prev,
          ];
        }

        return prev.map((story) =>
          story.id === storyId
            ? {
                ...story,
                date,
                paragraph: state.paragraphs?.[0] ?? state.sentences.join(" "),
              }
            : story,
        );
      });
    }
  }, [state.sentences, state.paragraphs]);

  useEffect(() => {
    getStories().then((stories) => {
      const storyList = stories.map((story) => ({
        id: story.id,
        date: story.date,
        title: story.title,
        context: story.context,
        paragraph: story.paragraphs?.[0] ?? story.sentences?.join(" "),
      }));

      setStoryList(storyList);
      if (stories.length > 0) {
        const latestStory = stories[0];
        setSelectedStoryId(latestStory.id);
        setState({
          date: latestStory.date,
          sentences: latestStory.sentences,
          paragraphs: latestStory.paragraphs,
          currentPrompt: null,
          isLoading: false,
        });
      }
    });
  }, []);

  return (
    <DefaultLayout>
      <NavigationLeftMenus
        onOpenSetting={handleOpenSetttings}
        onOpenSidebar={handleOpenSidebar}
        onNewClick={handleNewStory}
        isNewMenuEnabled={hasLicenseKey}
      />
      <NavigationRightMenus />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={handleCloseSettings}
        licenseKey={licenseKey}
        onLicenseKeyChange={handleCheckLicenseValidity}
      />

      <Sidebar
        isOpen={isSidebarOpen}
        stories={storyList}
        selectedStoryId={selectedStoryId}
        onClose={handleCloseSidebar}
        onSelectStory={handleSelectStory}
      />

      <ConfirmModal
        title="An error occurred"
        isOpen={isErrorModalOpen}
        onClose={handleCloseErrorModal}
      >
        <p className="leading-relaxed text-red-500">{errorMessage}</p>
        <button className="mx-auto w-full" onClick={handleCloseErrorModal}>
          OK
        </button>
      </ConfirmModal>

      <ConfirmModal
        title="New chapter / story creation"
        isOpen={isNewStoryWarningModalOpen}
        onClose={handleCloseNewStoryWarningModal}
      >
        <p className="leading-relaxed">
          Creating a new story or chapter will consume your creation quota for
          this month.
        </p>

        <div className="flex sm:flex-col md:flex-row md:items-center gap-3 [&>_button]:rounded">
          <button
            disabled={createNewStory.isLoading}
            className="flex-1 bg-blue-500 py-1 px-2 disabled:opacity-50"
            onClick={handleConsumeNewStoryQuota}
          >
            I Agree
          </button>
          <button
            className="flex-1 bg-gray-700 py-1 px-2"
            onClick={handleCloseNewStoryWarningModal}
          >
            Cancel
          </button>
        </div>
      </ConfirmModal>

      <ConfirmModal
        title="Invalid License Key"
        isOpen={isInvalidLicenseModalOpen}
        onClose={handleCloseInvalidLicenseKeyModal}
      >
        <p className="leading-relaxed">
          It has expired or is invalid. Please enter a valid license key to
          continue using Freeplotter.
        </p>
        <button
          className="mx-auto w-full"
          onClick={handleCloseInvalidLicenseKeyModal}
        >
          OK
        </button>
      </ConfirmModal>

      <Container>
        <HeaderTitle />

        {!hasLicenseKey ? (
          <LicenseKeyInput
            onSubmit={handleCheckLicenseValidity}
            isLoading={isCheckingLicenseKey}
          />
        ) : (
          <div className="space-y-8">
            {state.paragraphs.length > 0 && (
              <div className="space-y-8">
                {state.paragraphs.map((paragraph, index) => (
                  <div key={`paragraph-${index}`} className="group relative">
                    {editingParagraphIndex === index ? (
                      <ParagraphEditor
                        value={editingParagraphText}
                        onChange={setEditingParagraphText}
                        onCancel={handleCancelEdit}
                        onSave={handleSaveParagraph}
                      />
                    ) : (
                      <div className="relative">
                        <p
                          className="text-white/85 leading-relaxed pr-10 font-serif text-xl"
                          dangerouslySetInnerHTML={{
                            __html: transformToNewLine(paragraph),
                          }}
                        />
                        <button
                          disabled={paragraphState.isLoading}
                          onClick={() => handleEditParagraph(index)}
                          className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-20"
                          title="Edit paragraph"
                        >
                          <Edit2
                            size={20}
                            className="text-blue-400 hover:text-blue-300"
                          />
                        </button>
                        {!paragraphState.currentSuggestion && (
                          <button
                            disabled={paragraphState.isLoading}
                            onClick={() => handleGetSuggestion(index)}
                            className="absolute top-10 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacit disabled:opacity-20"
                            title="Get suggestion"
                          >
                            {paragraphState.isLoading ? (
                              <Loader
                                size={20}
                                className="text-green-500 animate-spin"
                              />
                            ) : (
                              <Sparkles
                                size={20}
                                className="text-blue-400 hover:text-blue-300"
                              />
                            )}
                          </button>
                        )}
                      </div>
                    )}

                    {paragraphState.paragraphIndex === index &&
                      !!paragraphState.currentSuggestion && (
                        <div className="my-2 py-2 px-4 flex flex-col gap-4">
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 mt-1">
                              {paragraphState.isLoading ? (
                                <Loader
                                  size={20}
                                  className="text-green-500 animate-spin"
                                />
                              ) : (
                                <MessageSquare
                                  size={20}
                                  className="text-green-500"
                                />
                              )}
                            </div>
                            <p
                              className="text-green-400 select-none pointer-events-none"
                              dangerouslySetInnerHTML={{
                                __html: transformToNewLine(
                                  paragraphState.currentSuggestion,
                                ),
                              }}
                            />
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
                  disabled={state.isLoading}
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
      </Container>
    </DefaultLayout>
  );
}

export default HomePage;
