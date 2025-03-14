import type { FC } from "react";
import { Check, X as XIcon } from "lucide-react";

export interface ParagraphEditorProps {
  value: string;
  onChange?: (value: string) => void;
  onCancel?: () => void;
  onSave?: () => void;
}

const PARAGRAPH_LIMIT = 1000;

export const ParagraphEditor: FC<ParagraphEditorProps> = ({
  value,
  onChange,
  onCancel,
  onSave,
}) => {
  const handleChange = (value: string) => {
    if (value.length <= PARAGRAPH_LIMIT) {
      onChange?.(value);
    }
  };

  return (
    <div className="space-y-2">
      <textarea
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        className="w-full p-4 bg-gray-800 border border-gray-700 rounded-lg text-stone-300 text-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        rows={Math.max(3, value.split("\n").length)}
        // @ts-ignore
        style={{ fieldSizing: "content" }}
      />
      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          <button
            onClick={onSave}
            className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-1"
          >
            <Check size={16} />
            <span>Save</span>
          </button>
          <button
            onClick={onCancel}
            className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-1"
          >
            <XIcon size={16} />
            <span>Cancel</span>
          </button>
        </div>
        <div className="text-sm text-gray-400">
          {value.length}/{PARAGRAPH_LIMIT}
        </div>
      </div>
    </div>
  );
};
