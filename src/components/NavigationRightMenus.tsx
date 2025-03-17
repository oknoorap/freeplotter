import type { FC } from "react";
import { BookOpenText, ListChecks } from "lucide-react";

export const NavigationRightMenus: FC = () => (
  <div className="fixed top-4 right-4 flex space-x-2 z-50">
    <a
      href="/"
      className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
      title="Homepage"
    >
      <BookOpenText size={24} className="text-gray-400" />
    </a>
    <a
      href="/outline"
      className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
      title="Outline Generator"
    >
      <ListChecks size={24} className="text-gray-400" />
    </a>
  </div>
);
