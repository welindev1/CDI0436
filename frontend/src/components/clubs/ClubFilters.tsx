'use client';

import { Search } from 'lucide-react';

interface ClubFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export default function ClubFilters({ searchTerm, onSearchChange }: ClubFiltersProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Buscar por nombre o código..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
    </div>
  );
}
