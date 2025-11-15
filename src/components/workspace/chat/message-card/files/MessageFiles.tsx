import { PuiStack } from 'piche.ui';
import { FC, useMemo } from 'react';
import type { ConversationMessage } from '../../../../firebase/conversations';
import { MessageFilePreview } from './MessageFilePreview';
import { MessageImagePreview } from './MessageImagePreview';

interface MessageFilesProps {
  message: ConversationMessage;
  onFileClick?: (fileUrl: string) => void;
}

const isImageFile = (url: string, fileName?: string): boolean => {
  // Extract filename from URL if not provided
  const name = fileName || url.split('/').pop() || '';
  
  // Check by URL extension
  if (url.match(/\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)(\?|$)/i)) {
    return true;
  }
  // Check by filename extension
  if (name.match(/\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)$/i)) {
    return true;
  }
  return false;
};

export const MessageFiles: FC<MessageFilesProps> = ({ message, onFileClick }) => {
  // Combine imageUrl (legacy) and fileUrls
  const allFiles = useMemo(() => {
    const fileUrls = message.fileUrls || [];
    const imageUrl = message.imageUrl;
    const files: Array<{ url: string; name: string; isImage: boolean }> = [];
    
    // Add legacy imageUrl if exists and not in fileUrls
    if (imageUrl && !fileUrls.includes(imageUrl)) {
      const fileName = imageUrl.split('/').pop() || 'image';
      files.push({ url: imageUrl, name: fileName, isImage: isImageFile(imageUrl, fileName) });
    }
    
    // Add fileUrls
    fileUrls.forEach((url, index) => {
      // Extract filename from URL - remove query params and get last part
      const urlParts = url.split('/');
      const lastPart = urlParts[urlParts.length - 1] || `file-${index}`;
      const fileName = lastPart.split('?')[0]; // Remove query params
      files.push({ url, name: fileName, isImage: isImageFile(url, fileName) });
    });
    
    return files;
  }, [message.fileUrls, message.imageUrl]);

  if (allFiles.length === 0) {
    return null;
  }

  const images = allFiles.filter(f => f.isImage);
  const otherFiles = allFiles.filter(f => !f.isImage);

  return (
    <PuiStack sx={{ gap: '8px', marginBottom: '8px', width: '100%', minWidth: 0 }}>
      {images.map((file, index) => (
        <MessageImagePreview
          key={`${file.url}-${index}`}
          imageUrl={file.url}
          alt={file.name}
          onClick={() => onFileClick?.(file.url)}
        />
      ))}
      {otherFiles.map((file, index) => (
        <MessageFilePreview
          key={`${file.url}-${index}`}
          fileUrl={file.url}
          fileName={file.name}
          onClick={() => onFileClick?.(file.url)}
        />
      ))}
    </PuiStack>
  );
};

