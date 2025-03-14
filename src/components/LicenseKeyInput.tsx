import { type FC, useState } from "react";
import { Key, Loader, Eye, EyeOff } from "lucide-react";
import { useBoolean } from "usehooks-ts";

interface LicenseKeyInputProps {
  onSubmit: (text: string) => void;
  isLoading?: boolean;
}

export const LicenseKeyInput: FC<LicenseKeyInputProps> = ({
  onSubmit,
  isLoading,
}) => {
  const {
    value: isReveal,
    setTrue: revealInput,
    setFalse: hideInput,
  } = useBoolean();
  const [text, setText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanText = text.trim();
    if (!cleanText) return;
    onSubmit(text.trim());
    setText("");
  };

  const handleKeydown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      handleSubmit(e);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <form onSubmit={handleSubmit} className="w-full">
        <div className="group flex items-center gap-4 bg-gray-800/50 rounded-lg px-6 focus-within:ring-2 focus-within:ring-blue-500 border border-gray-700">
          {isLoading ? (
            <Loader className="animate-spin" size={24} />
          ) : (
            <Key size={24} />
          )}

          <input
            autoFocus
            type={isReveal ? "text" : "password"}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeydown}
            placeholder={
              isLoading ? "Checking..." : "Enter License Key [press \u23CE]"
            }
            className="w-full py-4 bg-transparent rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-transparent border-none"
            disabled={isLoading}
          />

          <button
            type="button"
            onClick={isReveal ? hideInput : revealInput}
            className="text-gray-400 hover:text-gray-200"
          >
            {isReveal ? <EyeOff size={24} /> : <Eye size={24} />}
          </button>
        </div>
      </form>
    </div>
  );
};
