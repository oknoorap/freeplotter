import React from 'react';
import { format } from 'date-fns';
import { X, Clock } from 'lucide-react';
import type { WritingSession } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: WritingSession[];
  onSessionSelect: (session: WritingSession) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  sessions,
  onSessionSelect,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 left-0 w-80 bg-gray-800 shadow-xl z-40 transform transition-transform duration-300 ease-in-out z-[9999]">
      <div className="p-4 border-b border-gray-700 flex justify-between items-center">
        <h2 className="text-xl font-bold">History</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-white">
          <X size={24} />
        </button>
      </div>
      <div className="p-4 space-y-4 overflow-y-auto h-[calc(100vh-64px)]">
        {sessions.map((session) => (
          <button
            key={session.id}
            onClick={() => onSessionSelect(session)}
            className="w-full text-left p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
          >
            <div className="flex items-center space-x-2 text-gray-300 mb-2">
              <Clock size={16} />
              <span>{format(new Date(session.date), 'PPP')}</span>
            </div>
            <p className="text-sm text-gray-400 line-clamp-2">
              {session.paragraphs[0] || session.sentences[0]}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};