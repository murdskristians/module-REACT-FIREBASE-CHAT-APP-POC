import { PuiIcon, PuiSvgIcon } from 'piche.ui';
import type { ChangeEventHandler, MouseEvent } from 'react';
import { useCallback, useRef, useState } from 'react';

interface AddMediaProps {
  onFileSelect: (file: File) => void;
}

export function AddMedia({ onFileSelect }: AddMediaProps) {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsPopupOpen(!isPopupOpen);
  };

  const handleClose = () => {
    setIsPopupOpen(false);
  };

  const openFileDialog = useCallback(() => {
    handleClose();
    fileInputRef.current?.click();
  }, []);

  const handleMentionClick = useCallback(() => {
    handleClose();
    // Mention functionality not implemented yet
  }, []);

  const handleFilesSelected: ChangeEventHandler<HTMLInputElement> = useCallback(
    (e) => {
      const files = e.target.files;
      if (!files || files.length === 0) {
        return;
      }
      onFileSelect(files[0]);
      e.target.value = '';
    },
    [onFileSelect]
  );

  return (
    <div style={{ position: 'relative' }}>
      <button
        type="button"
        ref={anchorRef}
        className={`chat-panel__composer-button chat-panel__composer-button--add${isPopupOpen ? ' menu-is-open' : ''}`}
        onClick={handleClick}
        aria-label="Add media or mention"
        title="Add media or mention"
      >
        <PuiSvgIcon width={16} height={16} icon={PuiIcon.Plus} />
      </button>

      {isPopupOpen && (
        <>
          <div className="popup-overlay" onClick={handleClose}></div>
          <div className="popup-menu">
            <button
              type="button"
              className="popup-menu-item"
              onClick={handleMentionClick}
            >
              <PuiSvgIcon width={16} height={16} icon={PuiIcon.AtSign} />
              <span>Mention</span>
            </button>
            <button
              type="button"
              className="popup-menu-item"
              onClick={openFileDialog}
            >
              <PuiSvgIcon width={16} height={16} icon={PuiIcon.Attachment} />
              <span>Attachment</span>
            </button>
          </div>
        </>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFilesSelected}
      />
    </div>
  );
}
