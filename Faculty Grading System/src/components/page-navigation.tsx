import React from 'react';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PageNavigationProps {
  currentPage: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
  disabled?: boolean;
  size?: 'sm' | 'default' | 'lg';
}

export function PageNavigation({ 
  currentPage, 
  totalPages, 
  onPrevious, 
  onNext, 
  disabled = false,
  size = 'sm'
}: PageNavigationProps) {
  return (
    <div className="flex items-center justify-between">
      <Button
        variant="outline"
        size={size}
        onClick={onPrevious}
        disabled={disabled || currentPage <= 1}
        className="flex items-center gap-2"
      >
        <ChevronLeft className="h-4 w-4" />
        Previous
      </Button>
      
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <span>Page</span>
        <span className="font-medium">{currentPage}</span>
        <span>of</span>
        <span className="font-medium">{totalPages}</span>
      </div>
      
      <Button
        variant="outline"
        size={size}
        onClick={onNext}
        disabled={disabled || currentPage >= totalPages}
        className="flex items-center gap-2"
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}