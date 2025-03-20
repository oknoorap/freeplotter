import {
  useRef,
  type ChangeEvent,
  type FC,
  type KeyboardEvent,
  InputHTMLAttributes,
  useEffect,
} from "react";
import { UniqueIdentifier } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { List, Trash2 } from "lucide-react";

export type PlotItem = {
  id: UniqueIdentifier;
  context: string;
};

export interface PlotListItemProps {
  plot: PlotItem;
  inputProps?: InputHTMLAttributes<HTMLInputElement>;
  lastItem?: boolean;
  onChange?: (value: PlotItem) => void;
  onEnter?: () => void;
  onRemove?: (id: UniqueIdentifier) => void;
}

const INPUT_LIMIT = 100;

export const PlotListItem: FC<PlotListItemProps> = ({
  plot,
  inputProps,
  lastItem,
  onChange,
  onEnter,
  onRemove,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: plot.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isRemovable = !!onRemove;

  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const context = event.target.value.substring(0, INPUT_LIMIT);
    onChange?.({
      id: plot.id,
      context,
    });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      const inputValue = !inputRef?.current?.value.trim();
      if (!inputValue) onEnter?.();
    }
  };

  const handleRemove = () => onRemove?.(plot.id);

  useEffect(() => {
    if (lastItem) inputRef?.current?.focus();
  }, [lastItem]);

  return (
    <div
      className="flex items-center gap-4 p-4 bg-gray-800 rounded-lg shadow-md focus-within:ring-2 focus-within:ring-blue-500"
      ref={setNodeRef}
      style={style}
    >
      <div className="drag-handler cursor-grab" {...attributes} {...listeners}>
        <List size={24} />
      </div>
      <div className="flex gap-4 items-center flex-1">
        <input
          ref={inputRef}
          className="plot-item flex-1 bg-transparent border-none outline-none text-lg placeholder:opacity-45 w-full"
          placeholder={`Add new plot [press \u23CE]`}
          value={plot.context}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          {...inputProps}
        />
        <div className="opacity-50">
          {inputRef?.current?.value?.substring(0, INPUT_LIMIT).length ?? 0}/
          {INPUT_LIMIT}
        </div>
      </div>
      {isRemovable && (
        <button onClick={handleRemove}>
          <Trash2 size={24} className="text-red-500" />
        </button>
      )}
    </div>
  );
};
