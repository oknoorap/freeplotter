import React from 'react';
import { MessageSquare, Loader } from 'lucide-react';

interface SentenceListProps {
  sentences: string[];
  currentPrompt: string | null;
  isLoading: boolean;
}

export const SentenceList: React.FC<SentenceListProps> = ({ 
  sentences, 
  currentPrompt,
  isLoading 
}) => {
  return (
    <div className="space-y-4">
      {sentences.map((sentence, index) => (
        <div key={index} className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-1">
            <MessageSquare size={20} className="text-blue-500" />
          </div>
          <p className="text-white/90">{sentence}</p>
        </div>
      ))}
      {(currentPrompt || isLoading) && (
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-1">
            {isLoading ? (
              <Loader size={20} className="text-green-500 animate-spin" />
            ) : (
              <MessageSquare size={20} className="text-green-500" />
            )}
          </div>
          <p className="text-green-400">
            {currentPrompt}
          </p>
        </div>
      )}
    </div>
  );
};