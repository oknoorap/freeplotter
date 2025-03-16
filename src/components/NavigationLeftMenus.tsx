import type { FC } from "react";
import { Menu, PlusCircle, Settings } from "lucide-react";

export interface NavigationLeftMenusProps {
  isSidebarMenuVisible?: boolean;
  isNewMenuEnabled?: boolean;
  newLabel?: string;
  onOpenSetting?: () => void;
  onOpenSidebar?: () => void;
  onNewClick?: () => void;
}

export const NavigationLeftMenus: FC<NavigationLeftMenusProps> = ({
  isSidebarMenuVisible = true,
  isNewMenuEnabled,
  newLabel = "Start New Story",
  onOpenSetting,
  onOpenSidebar,
  onNewClick,
}) => (
  <div className="fixed top-4 left-4 flex space-x-2 z-50">
    <button
      onClick={onOpenSetting}
      className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
      title="Settings"
    >
      <Settings size={24} className="text-gray-400" />
    </button>
    {isSidebarMenuVisible && (
      <button
        onClick={onOpenSidebar}
        className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
        title="Story History"
      >
        <Menu size={24} className="text-gray-400" />
      </button>
    )}
    <button
      onClick={onNewClick}
      disabled={!isNewMenuEnabled}
      className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-35"
      title={newLabel}
    >
      <PlusCircle size={24} className="text-gray-400" />
    </button>
  </div>
);
