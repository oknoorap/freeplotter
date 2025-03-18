import React from "react";
import { format } from "date-fns";
import { X, Clock } from "lucide-react";
import clsx from "clsx";

import type { StoryItem } from "../types";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  stories: StoryItem[];
  onSelectStory: (story: StoryItem) => void;
  selectedStoryId?: string;
}

const sortStoriesByDate = (stories: StoryItem[]) => {
  stories.sort(
    (a, z) => new Date(z.date).getTime() - new Date(a.date).getTime(),
  );
  return stories;
};

const sortStoriesBySelected = (
  selectedStoryId?: string,
  stories: StoryItem[] = [],
) => {
  stories.sort((a, z) => {
    if (a.id === selectedStoryId) return -1;
    if (z.id === selectedStoryId) return 1;
    return 0;
  });
  return stories;
};

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  stories,
  selectedStoryId,
  onSelectStory,
  onClose,
}) => {
  return (
    <>
      <div
        aria-hidden
        className={clsx(
          "fixed top-0 left-0 w-screen h-screen bg-stone-100 transition-all ease-in-out ",
          isOpen
            ? "bg-opacity-20 z-[9999]"
            : "bg-opacity-0 z-0 pointer-events-none",
        )}
        onClick={onClose}
      />
      <div
        className={clsx(
          `fixed inset-y-0 left-0 w-80 bg-gray-800 shadow-xl transform transition-transform duration-300 ease-in-out z-[9999]`,
          isOpen ? "translate-x-0" : "-translate-x-[500px]",
        )}
      >
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold">History</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>
        <div className="p-4 space-y-4 overflow-y-auto h-[calc(100vh-64px)]">
          {sortStoriesBySelected(
            selectedStoryId,
            sortStoriesByDate(stories),
          ).map((story) => {
            const isSelected = story.id === selectedStoryId;
            return (
              <button
                key={story.id}
                onClick={() => onSelectStory(story)}
                className={`w-full text-left p-4 rounded-lg transition-colors ${
                  isSelected
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-gray-700 hover:bg-gray-600"
                }`}
              >
                <div className="flex items-center space-x-2 text-gray-300 mb-2">
                  <Clock size={16} />
                  <span>{format(new Date(story.date), "PPP")}</span>
                  {isSelected && (
                    <span className="px-2 py-0.5 text-xs bg-blue-500 text-white rounded-full ml-auto">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-200 line-clamp-2">
                  {story.paragraph || "..."}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};
