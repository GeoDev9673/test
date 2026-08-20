import React, { useEffect } from 'react';

interface SiteProtectionProps {
  children: React.ReactNode;
}

export const SiteProtection: React.FC<SiteProtectionProps> = ({ children }) => {
  useEffect(() => {
    // 1. Prevent Right-Click / Context Menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // 2. Prevent Drag-and-Drop of media files
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
    };

    // 3. Block Developer Tools & Copy Shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12 key
      if (e.key === 'F12' || e.keyCode === 123) {
        e.preventDefault();
        return false;
      }

      // Ctrl+Shift+I (DevTools), Ctrl+Shift+J (Console), Ctrl+Shift+C (Inspect)
      if (
        (e.ctrlKey || e.metaKey) &&
        e.shiftKey &&
        ['I', 'i', 'J', 'j', 'C', 'c'].includes(e.key)
      ) {
        e.preventDefault();
        return false;
      }

      // Ctrl+U (View Source), Ctrl+S (Save Page), Ctrl+P (Print Page)
      if (
        (e.ctrlKey || e.metaKey) &&
        ['u', 'U', 's', 'S', 'p', 'P'].includes(e.key)
      ) {
        e.preventDefault();
        return false;
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('dragstart', handleDragStart);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('dragstart', handleDragStart);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="select-none">
      {children}
    </div>
  );
};
