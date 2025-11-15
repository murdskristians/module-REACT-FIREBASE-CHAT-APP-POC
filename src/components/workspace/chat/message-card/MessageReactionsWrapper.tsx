import EmojiPicker from 'emoji-picker-react';
import type { FC, MouseEvent } from 'react';

import { addReaction } from '../../../../firebase/conversations';
import { getCurrentUser } from '../../../../firebase/auth';
import { MessageReactionsListWrapper } from './StyledComponents';

interface MessageReactionsWrapperProps {
  messageId: string;
  conversationId: string;
  userReactions: Array<{ emoji: string; reactedBy: string }>;
  handleClose: (e: MouseEvent<HTMLElement>) => void;
}

export const MessageReactionsWrapper: FC<MessageReactionsWrapperProps> = ({ 
  messageId, 
  conversationId,
  userReactions,
  handleClose 
}) => {
  const handleReaction = async ({ unified }: { unified: string }, e: unknown) => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      return;
    }

    const foundClickedUserReaction = userReactions.find(({ emoji }) => emoji === unified);

    try {
      if (foundClickedUserReaction) {
        // Reaction already exists, it will be removed by addReaction (toggle behavior)
        await addReaction(conversationId, messageId, unified, currentUser.uid);
      } else {
        // Add new reaction
        await addReaction(conversationId, messageId, unified, currentUser.uid);
      }
    } catch (error) {
      console.error('Failed to add/remove reaction:', error);
    }

    handleClose(e as MouseEvent<HTMLElement>);
  };

  return (
    <MessageReactionsListWrapper>
      <EmojiPicker
        reactionsDefaultOpen={true}
        allowExpandReactions={false}
        reactions={['1f44d', '1f44e', '2764-fe0f', '1f60a', '1f604']} // 👍, 👎, ❤️, 😊, 😄
        onReactionClick={handleReaction}
        lazyLoadEmojis
      />
    </MessageReactionsListWrapper>
  );
};

