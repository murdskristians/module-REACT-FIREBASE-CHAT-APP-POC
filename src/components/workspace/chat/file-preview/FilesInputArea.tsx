import { PuiBox, PuiIcon, PuiSvgIcon, PuiStack } from 'piche.ui';
import { useRef, useState, useEffect, useCallback } from 'react';
import { FilePreview } from './FilePreview';
import type { FilePreviewItem } from './FilePreview';

export type { FilePreviewItem };

interface FilesInputAreaProps {
  files: FilePreviewItem[];
  onRemoveFile: (id: string) => void;
  children: React.ReactNode;
}

const SCROLL_STEP_PX = 200;

export const FilesInputArea: React.FC<FilesInputAreaProps> = ({ files, onRemoveFile, children }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollButtons = useCallback(() => {
    if (containerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth);
    }
  }, []);

  useEffect(() => {
    updateScrollButtons();
  }, [files.length, updateScrollButtons]);

  const scroll = (direction: number) => {
    if (containerRef.current) {
      containerRef.current.scrollBy({
        left: direction * SCROLL_STEP_PX,
        behavior: 'smooth',
      });
    }
  };

  if (files.length === 0) {
    return <>{children}</>;
  }

  return (
    <PuiStack sx={{ gap: '12px', padding: '4px 0' }}>
      <PuiBox sx={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {canScrollLeft && (
          <PuiBox
            onClick={() => scroll(-1)}
            sx={{
              position: 'absolute',
              left: '-8px',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 10,
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: 'white',
              border: '1px solid #f0f0f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              '&:hover': {
                background: '#f5f5f5',
              },
            }}
          >
            <PuiSvgIcon icon={PuiIcon.ChevronLeft} width={16} height={16} />
          </PuiBox>
        )}
        <PuiStack
          ref={containerRef}
          onScroll={updateScrollButtons}
          sx={{
            flexDirection: 'row',
            gap: '8px',
            paddingBottom: '8px',
            borderBottom: '1px solid #f0f0f0',
            width: '100%',
            overflowX: 'auto',
            overflowY: 'hidden',
            '&::-webkit-scrollbar': {
              height: '7px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'transparent',
            },
            '& > *': {
              flexShrink: 0,
            },
          }}
        >
          {files.map((file) => (
            <FilePreview key={file.id} item={file} onRemove={onRemoveFile} />
          ))}
        </PuiStack>
        {canScrollRight && (
          <PuiBox
            onClick={() => scroll(1)}
            sx={{
              position: 'absolute',
              right: '-8px',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 10,
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: 'white',
              border: '1px solid #f0f0f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              '&:hover': {
                background: '#f5f5f5',
              },
            }}
          >
            <PuiSvgIcon icon={PuiIcon.ChevronRight} width={16} height={16} />
          </PuiBox>
        )}
      </PuiBox>
      {children}
    </PuiStack>
  );
};

