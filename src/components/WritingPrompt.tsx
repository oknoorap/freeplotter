import React, { useEffect, useRef, useState } from "react";
import { PenLine, Loader, SendIcon } from "lucide-react";

interface WritingPromptProps {
  onSubmit: (text: string) => void;
  placeholder: string;
  isLoading: boolean;
}

const MAX_LENGTH = 200;

export const WritingPrompt: React.FC<WritingPromptProps> = ({
  onSubmit,
  placeholder,
  isLoading,
}) => {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [text, setText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanText = text.trim();
    if (!cleanText) return;
    onSubmit(text.trim());
    setText("");
  };

  const handleChange = (value: string) => {
    if (value.length <= MAX_LENGTH) {
      setText(value);
    }
  };

  const handleKeydown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      handleSubmit(e);
    }
  };

  useEffect(() => {
    if (!isLoading) {
      textAreaRef?.current?.focus();
    }
  }, [isLoading]);

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative">
        <div className="absolute left-4 top-4 text-gray-400">
          <PenLine size={24} />
        </div>

        <div className="relative">
          <textarea
            autoFocus
            ref={textAreaRef}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={handleKeydown}
            placeholder={placeholder}
            rows={2}
            // @ts-ignore
            style={{ fieldSizing: "content" }}
            className="w-full px-14 py-4 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
            value={text}
          />
          {isLoading ? (
            <div className="absolute text-gray-500 hover:text-gray-200 top-4 right-4">
              <Loader className="animate-spin text-gray-400" size={24} />{" "}
            </div>
          ) : (
            <button
              disabled={!text?.trim()}
              onClick={handleSubmit}
              className="absolute text-gray-500 hover:text-gray-200 top-4 right-4"
            >
              <SendIcon size={24} />
            </button>
          )}
        </div>

        <div className="text-right text-gray-400">
          <span>
            {text.length}/{MAX_LENGTH}
          </span>
        </div>
      </div>
    </form>
  );
};
