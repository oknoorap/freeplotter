import type { ElementType, FC } from "react";
import { Brain } from "lucide-react";

export interface HeaderTitleProps {
  title?: string;
  description?: string;
  icon?: ElementType;
}

export const HeaderTitle: FC<HeaderTitleProps> = ({
  title = "Stream your thought",
  description = "A free-writing framework for fiction writers.",
  icon: Icon = Brain,
}) => (
  <div className="text-center mb-12">
    <div className="flex justify-center mb-4">
      <Icon size={48} className="text-blue-500" />
    </div>
    <h1 className="text-5xl font-bold mb-4">{title}</h1>
    <p className="text-xl text-gray-400">{description}</p>
  </div>
);
