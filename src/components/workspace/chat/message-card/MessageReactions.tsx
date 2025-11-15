import { Emoji } from 'emoji-picker-react';
import { PuiTypography, useTheme } from 'piche.ui';
import type { FC } from 'react';

import type { MessageReaction } from '../../../../firebase/conversations';
import { addReaction } from '../../../../firebase/conversations';
import { getCurrentUser } from '../../../../firebase/auth';
import { StyledMessageReaction, StyledReactionsContainer } from './StyledComponents';

interface MessageReactionsProps {
  reactions: MessageReaction[];
  messageId: string;
  conversationId: string;
  isUserMessage: boolean;
  currentUserId: string;
}

// Group reactions by emoji
const groupReactionsByEmoji = (reactions: MessageReaction[]) => {
  const grouped: Record<string, MessageReaction[]> = {};
  reactions.forEach((reaction) => {
    if (!grouped[reaction.emoji]) {
      grouped[reaction.emoji] = [];
    }
    grouped[reaction.emoji].push(reaction);
  });
  return grouped;
};

export const MessageReactions: FC<MessageReactionsProps> = ({
  reactions,
  messageId,
  conversationId,
  isUserMessage,
  currentUserId,
}) => {
  const theme = useTheme();
  const groupedReactions = groupReactionsByEmoji(reactions);
  const reactionEntries = Object.entries(groupedReactions);

  const handleReactionClick = async (emoji: string) => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      return;
    }

    try {
      await addReaction(conversationId, messageId, emoji, currentUser.uid);
    } catch (error) {
      console.error('Failed to toggle reaction:', error);
    }
  };

  if (reactionEntries.length === 0) {
    return null;
  }

  const isWrapped = reactionEntries.length > 1;

  return (
    <StyledReactionsContainer isWrapped={isWrapped} hasReaction={reactionEntries.length > 0}>
      {reactionEntries.map(([emoji, reactionList]) => {
        const hasUserReaction = reactionList.some((r) => r.reactedBy === currentUserId);
        const count = reactionList.length;

        return (
          <StyledMessageReaction
            key={emoji}
            isUserMessage={isUserMessage}
            hasUserReaction={hasUserReaction}
            onClick={() => handleReactionClick(emoji)}
          >
            <Emoji unified={emoji} size={16} />
            {count > 1 && (
              <PuiTypography
                variant="body-xs-medium"
                className="reactions-count-wrapper"
                color={hasUserReaction ? theme.palette.background.paper : theme.palette.primary.main}
              >
                {count}
              </PuiTypography>
            )}
          </StyledMessageReaction>
        );
      })}
    </StyledReactionsContainer>
  );
};

