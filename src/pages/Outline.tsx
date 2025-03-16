import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  UniqueIdentifier,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import cx from "clsx";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Loader } from "lucide-react";
import { ChangeEvent, useEffect, useState } from "react";
import { ulid } from "ulid";
import { useBoolean } from "usehooks-ts";
import { ConfirmModal } from "../components/ConfirmModal";
import { GenreSelector } from "../components/GenreSelector";
import { HeaderTitle } from "../components/HeaderTitle";
import { LicenseKeyInput } from "../components/LicenseKeyInput";
import { NavigationLeftMenus } from "../components/NavigationLeftMenus";
import { NavigationRightMenus } from "../components/NavigationRightMenus";
import { OutlineDocument } from "../components/OutlineDocument";
import { PlotItem, PlotListItem } from "../components/PlotListItem";
import { RangeSlider } from "../components/RangeSlider";
import { SettingsModal } from "../components/SettingsModal";
import { SummaryInput } from "../components/SummaryInput";
import { useCheckLicense, useGenerateOutline } from "../hooks/useAPI";
import { useLicenseKey } from "../hooks/useLicenseKey";
import { Container } from "../layouts/container";
import { DefaultLayout } from "../layouts/default";
import { pdf } from "@react-pdf/renderer";

const PLOT_LIMIT = 50;

function OutlinePage() {
  const { licenseKey, hasLicenseKey } = useLicenseKey();
  const {
    value: isSettingsOpen,
    setTrue: handleOpenSetttings,
    setFalse: handleCloseSettings,
  } = useBoolean();

  const {
    value: isInvalidLicenseModalOpen,
    setTrue: handleOpenInvalidLicenseModal,
    setFalse: handleCloseInvalidLicenseModal,
  } = useBoolean();

  const {
    value: isInvalidFormOpen,
    setTrue: handleOpenInvalidFormModal,
    setFalse: handleCloseInvalidFormModal,
  } = useBoolean();

  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [numChapters, setNumChapters] = useState(30);
  const handleNumChaptersChange = (value: number) => {
    setNumChapters(value);
  };

  const [genre, setGenre] = useState("Fantasy");
  const handleChangeGenre = (event: ChangeEvent<HTMLSelectElement>) =>
    setGenre(event.target.value);

  const [plots, setPlots] = useState<PlotItem[]>([
    {
      id: ulid(),
      context: "",
    },
  ]);

  const hasPlotReachLimit = plots.length >= PLOT_LIMIT;

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleMovePlot = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!!over && active.id !== over.id) {
      setPlots((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handlePlotContextChange =
    (id: UniqueIdentifier) => (plot: PlotItem) => {
      const plotIndex = plots.findIndex((plot) => plot.id === id);
      if (plotIndex < 0) return;
      const newPlots = plots.map((plotItem, index) => {
        if (plotIndex === index) return { ...plot, context: plot.context };
        return plotItem;
      });
      setPlots(newPlots);
    };

  const handleAddPlot = () => {
    if (hasPlotReachLimit) return;
    const newPlots = [...plots];
    newPlots.push({ id: ulid(), context: "" });
    setPlots(newPlots);
  };

  const handleRemovePlot = (id: UniqueIdentifier) => {
    const newPlots = [...plots].filter((plot) => plot.id !== id);
    setPlots(newPlots);
  };

  const {
    isLoading: isCheckingLicenseKey,
    checkLicenseKey,
    clearEnteredLicenseKey,
  } = useCheckLicense({
    onInvalid: handleOpenInvalidLicenseModal,
  });

  const handleCheckLicenseValidity = async (licenseKey: string) => {
    try {
      await checkLicenseKey(licenseKey);
    } catch (error) {
      console.error("Error checking license key:", error);
    }
  };

  const handleCloseInvalidLicenseKeyModal = () => {
    handleCloseInvalidLicenseModal();
    clearEnteredLicenseKey();
  };

  const handleNewOutline = () => {};

  const generateOutline = useGenerateOutline();
  const isGenerating = generateOutline.isLoading;

  const handleGenerateOutline = async () => {
    if (!title.length || plots.length < 5) {
      return handleOpenInvalidFormModal();
    }

    try {
      const { outline, premise } = await generateOutline.mutateAsync({
        title,
        summary,
        genre,
        numChapters,
        plots: plots.map(({ context }) => context),
      });

      const blob = await pdf(
        <OutlineDocument
          title={title}
          summary={summary}
          premise={premise}
          outline={outline}
        />,
      ).toBlob();
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, "_blank");
    } catch (error) {
      alert(
        `An error occurred: ${(error as Error)?.message ?? "Unknown Error"}`,
      );
    }
  };

  useEffect(() => {
    if (hasLicenseKey) checkLicenseKey(licenseKey);
  }, [hasLicenseKey, licenseKey]);

  return (
    <DefaultLayout>
      <NavigationLeftMenus
        isNewMenuEnabled
        newLabel="Generate New Outline"
        isSidebarMenuVisible={false}
        onOpenSetting={handleOpenSetttings}
        onNewClick={handleNewOutline}
      />
      <NavigationRightMenus />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={handleCloseSettings}
        licenseKey={licenseKey}
        onLicenseKeyChange={handleCheckLicenseValidity}
      />

      <ConfirmModal
        title="Can't generate outline"
        isOpen={isInvalidFormOpen}
        onClose={handleCloseInvalidFormModal}
      >
        <p className="leading-relaxed">
          Please add at least a title or 5 plot points.
        </p>
        <button
          className="mx-auto w-full"
          onClick={handleCloseInvalidFormModal}
        >
          OK
        </button>
      </ConfirmModal>

      <ConfirmModal
        title="Invalid License Key"
        isOpen={isInvalidLicenseModalOpen}
        onClose={handleCloseInvalidLicenseKeyModal}
      >
        <p className="leading-relaxed">
          It's expired or invalid. Please enter a valid License Key to continue
          using Freeplotter.
        </p>
        <button
          className="mx-auto w-full"
          onClick={handleCloseInvalidLicenseKeyModal}
        >
          OK
        </button>
      </ConfirmModal>

      <Container>
        <HeaderTitle
          title="Outline Generator"
          description="Share a title and a bit about your story, and the AI will generate a story map for you!"
        />

        {!hasLicenseKey ? (
          <LicenseKeyInput
            onSubmit={handleCheckLicenseValidity}
            isLoading={isCheckingLicenseKey}
          />
        ) : (
          <div className="flex flex-col gap-8">
            <fieldset
              className={cx(
                "flex flex-col gap-2",
                isGenerating && "opacity-35",
              )}
            >
              <label className="block text-lg font-semibold" htmlFor="title">
                Title
              </label>
              <input
                value={title}
                maxLength={200}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isGenerating}
                type="text"
                id="title"
                className="text-lg w-full p-4 bg-gray-800/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-transparent border border-gray-700 focus:ring-2 focus:ring-blue-500"
              />
            </fieldset>

            <fieldset
              className={cx(
                "flex flex-col gap-2",
                isGenerating && "opacity-35",
              )}
            >
              <label className="block text-lg font-semibold" htmlFor="summary">
                Summary
              </label>
              <SummaryInput
                value={summary}
                onChange={setSummary}
                disabled={isGenerating}
              />
            </fieldset>

            <fieldset
              className={cx(
                "flex flex-col gap-2",
                isGenerating && "opacity-35",
              )}
            >
              <label className="block text-lg font-semibold" htmlFor="genre">
                Genre
              </label>
              <GenreSelector
                value={genre}
                onChange={handleChangeGenre}
                disabled={isGenerating}
              />
            </fieldset>

            <fieldset
              className={cx(
                "flex flex-col gap-2",
                isGenerating && "opacity-35",
              )}
            >
              <label className="block text-lg font-semibold" htmlFor="chapters">
                Num. of Chapters
              </label>

              <div className="flex items-center gap-4">
                <div className="flex-1 w-full">
                  <RangeSlider
                    id="chapters"
                    step={1}
                    min={1}
                    max={50}
                    value={numChapters}
                    onChange={handleNumChaptersChange}
                  />
                </div>
                <strong className="inline-flex w-auto">
                  {numChapters} Chapters
                </strong>
              </div>
            </fieldset>

            <fieldset
              className={cx(
                "flex flex-col gap-2",
                isGenerating && "opacity-35",
              )}
            >
              <label className="block text-lg font-semibold" htmlFor="plot">
                Plots (Max {PLOT_LIMIT})
              </label>
              <p className="text-gray-400 text-lg mb-2 p-4 bg-gray-800 rounded-lg bg-opacity-80">
                To get the best results, share your key scenes, exciting story
                elements, and the moments that really bring your narrative to
                life. The more details you provide, the better the system can
                help refine and shape your story!
              </p>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleMovePlot}
              >
                <SortableContext
                  items={plots}
                  strategy={verticalListSortingStrategy}
                >
                  {plots.map((plot, index) => (
                    <PlotListItem
                      key={plot.id}
                      plot={plot}
                      inputProps={{ disabled: isGenerating }}
                      onChange={handlePlotContextChange(plot.id)}
                      onEnter={handleAddPlot}
                      onRemove={index > 0 ? handleRemovePlot : undefined}
                    />
                  ))}
                </SortableContext>
              </DndContext>
              {hasPlotReachLimit && (
                <div className="text-red-500 text-sm">
                  Plot limit reached. You can't add more plots!
                </div>
              )}
            </fieldset>

            <button
              className="flex items-center justify-center font-bold gap-2 w-full py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-45"
              onClick={handleGenerateOutline}
              disabled={isCheckingLicenseKey}
            >
              {isGenerating ? (
                <>
                  <Loader className="animate-spin" />
                  <span>Processing, generating PDF file...</span>
                </>
              ) : (
                "Generate!"
              )}
            </button>
          </div>
        )}
      </Container>
    </DefaultLayout>
  );
}

export default OutlinePage;
