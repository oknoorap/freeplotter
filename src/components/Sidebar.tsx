import React from 'react';
import { format } from 'date-fns';
import { X, Clock } from 'lucide-react';
import cx from 'clsx'

import type { WritingSession } from '../types';
import clsx from 'clsx';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: WritingSession[];
  onSessionSelect: (session: WritingSession) => void;
  currentSessionId: string | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  sessions,
  onSessionSelect,
  currentSessionId,
}) => {
  return (
    <>
    <div className={clsx("fixed z-[999] top-0 left-0 w-screen h-screen bg-stone-100 transition-all ease-in-out", isOpen ? 'bg-opacity-20' : 'bg-opacity-0 pointer-events-none')}  onClick={onClose} />
    <div className={cx(`fixed inset-y-0 left-0 w-80 bg-gray-800 shadow-xl z-40 transform transition-transform duration-300 ease-in-out z-[9999]`, isOpen ? 'translate-x-0' : '-translate-x-[500px]')}>
      <div className="p-4 border-b border-gray-700 flex justify-between items-center">
        <h2 className="text-xl font-bold">History</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-white">
          <X size={24} />
        </button>
      </div>
      <div className="p-4 space-y-4 overflow-y-auto h-[calc(100vh-64px)]">
        {sessions.map((session) => {
          const isActive = session.id === currentSessionId;
          return (
            <button
              key={session.id}
              onClick={() => onSessionSelect(session)}
              className={`w-full text-left p-4 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              <div className="flex items-center space-x-2 text-gray-300 mb-2">
                <Clock size={16} />
                <span>{format(new Date(session.date), 'PPP')}</span>
                {isActive && (
                  <span className="px-2 py-0.5 text-xs bg-blue-500 text-white rounded-full ml-auto">
                    Active
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-200 line-clamp-2">
                {session.paragraphs[0] || session.sentences[0]}
              </p>
            </button>
          );
        })}
      </div>
    </div>
    </>
  );
}