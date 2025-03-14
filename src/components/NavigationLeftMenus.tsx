import type { FC } from "react";
import { Menu, PlusCircle, Settings } from "lucide-react";

export interface NavigationLeftMenusProps {
  onOpenSetting?: () => void;
  onOpenSidebar?: () => void;
  onNewStoryClick?: () => void;
  isNewStoryEnabled?: boolean;
}

export const NavigationLeftMenus: FC<NavigationLeftMenusProps> = ({
  onOpenSetting,
  onOpenSidebar,
  onNewStoryClick,
  isNewStoryEnabled,
}) => (
  <div className="fixed top-4 left-4 flex space-x-2 z-50">
    <button
      onClick={onOpenSetting}
      className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
      title="Settings"
    >
      <Settings size={24} className="text-gray-400" />
    </button>
    <button
      onClick={onOpenSidebar}
      className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
      title="Story History"
    >
      <Menu size={24} className="text-gray-400" />
    </button>
    <button
      onClick={onNewStoryClick}
      disabled={!isNewStoryEnabled}
      className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-35"
      title="Start New Story"
    >
      <PlusCircle size={24} className="text-gray-400" />
    </button>
  </div>
);
