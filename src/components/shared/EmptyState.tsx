import React from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  message?: string;
}

export function EmptyState({ message = 'No items found' }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
      <Inbox className="w-12 h-12 mb-3 opacity-30" />
      <p className="text-sm">{message}</p>
    </div>
  );
}
