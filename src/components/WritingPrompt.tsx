import React, { useEffect, useRef, useState } from 'react';
import { PenLine, Key, Loader, SendIcon } from 'lucide-react';

interface WritingPromptProps {
  onSubmit: (text: string) => void;
  placeholder: string;
  isLoading: boolean;
  isApiKeyInput?: boolean;
}

export const WritingPrompt: React.FC<WritingPromptProps> = ({
  onSubmit,
  placeholder,
  isLoading,
  isApiKeyInput = false
}) => {
  const textAreaRef = useRef<HTMLTextAreaElement>(null)
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(text.trim());
    setText('');
    
  };

  useEffect(() => {
    if (!isLoading) {
      textAreaRef?.current?.focus();
    }
  }, [isLoading])

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative">
        <div className="absolute left-4 top-4 text-gray-400">
          {isApiKeyInput ? <Key size={24} /> : <PenLine size={24} />}
        </div>

        {isApiKeyInput ?
          <input
            type="password"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={placeholder}
            className="w-full px-14 py-4 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          /> :
          <div className="relative">
            <textarea
              ref={textAreaRef}
              onChange={(e) => setText(e.target.value)}
              placeholder={placeholder}
              rows={2}
              // @ts-ignore
              style={{fieldSizing: 'content' }}
              className="w-full px-14 py-4 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
              value={text}
            />
            <button onClick={handleSubmit} className="absolute text-gray-500 hover:text-gray-200 bottom-4 right-4"><SendIcon size={24} /></button>
          </div>
        }
        {isLoading && (
          <div className="absolute right-4 top-4">
            <Loader className="animate-spin text-gray-400" size={24} />
          </div>
        )}
      </div>
    </form>
  );
};