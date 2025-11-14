import EmojiPicker from 'emoji-picker-react';
import { useTheme } from 'piche.ui';
import type { FC, MouseEvent } from 'react';

import { MessageReactionsListWrapper } from './StyledComponents';

interface MessageReactionsWrapperProps {
  messageId: string;
  handleClose: (e: MouseEvent<HTMLElement>) => void;
}

export const MessageReactionsWrapper: FC<MessageReactionsWrapperProps> = ({ messageId, handleClose }) => {
  const theme = useTheme();

  const handleReaction = ({ unified }: { unified: string }, e: unknown) => {
    // No logic - just close
    handleClose(e as MouseEvent<HTMLElement>);
  };

  return (
    <MessageReactionsListWrapper>
      <EmojiPicker
        reactionsDefaultOpen={true}
        allowExpandReactions={false}
        reactions={['1f44f', '1f44d', '1f642', '1f973', '263a-fe0f']} // 👏, 👍, 🙂, 🥳, ☺️
        onReactionClick={handleReaction}
        lazyLoadEmojis
      />
    </MessageReactionsListWrapper>
  );
};

