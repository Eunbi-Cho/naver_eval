import React, { useState, useCallback, useEffect } from 'react';

interface ResizeHandlerProps {
  onResize: (width: number) => void;
  initialWidth: number;
}

export const ResizeHandler: React.FC<ResizeHandlerProps> = ({ onResize, initialWidth }) => {
  const [isResizing, setIsResizing] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(initialWidth);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsResizing(true);
    setStartX(e.clientX);
    setStartWidth(initialWidth);
  }, [initialWidth]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;
    const diff = e.clientX - startX;
    onResize(Math.max(50, startWidth + diff)); // Minimum width of 50px
  }, [isResizing, onResize, startWidth, startX]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  return (
    <div
      className="w-1 h-full cursor-col-resize bg-gray-300 hover:bg-blue-500 transition-colors"
      onMouseDown={handleMouseDown}
    />
  );
};

