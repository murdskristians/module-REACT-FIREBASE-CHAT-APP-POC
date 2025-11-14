import { PuiStack } from 'piche.ui';
import { useEffect, useState } from 'react';

import { auth } from '../../../firebase';
import type { AiConversation, AiMessage } from '../../../firebase/ai';
import {
  createAiConversation,
  generateConversationTitle,
  sendAiMessage,
  subscribeToAiConversations,
  subscribeToAiMessages,
  updateAiConversationTitle,
} from '../../../firebase/ai';
import { AiChatView } from './AiChatView';
import { AiConversationList } from './AiConversationList';

export function AiPanel() {
  const [conversations, setConversations] = useState<AiConversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const currentUser = auth.currentUser;
  const selectedConversation = conversations.find((c) => c.id === selectedConversationId);

  // Subscribe to user's AI conversations
  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = subscribeToAiConversations(currentUser.uid, (updatedConversations) => {
      setConversations(updatedConversations);

      // Auto-select the first conversation if none selected
      if (!selectedConversationId && updatedConversations.length > 0) {
        setSelectedConversationId(updatedConversations[0].id);
      }
    });

    return () => unsubscribe();
  }, [currentUser, selectedConversationId]);

  // Subscribe to messages in the selected conversation
  useEffect(() => {
    if (!selectedConversationId) {
      setMessages([]);
      return;
    }

    const unsubscribe = subscribeToAiMessages(selectedConversationId, (updatedMessages) => {
      setMessages(updatedMessages);
      setIsSending(false);
    });

    return () => unsubscribe();
  }, [selectedConversationId]);

  const handleNewConversation = async () => {
    if (!currentUser) return;

    try {
      const newConversationId = await createAiConversation(
        currentUser.uid,
        'New Conversation'
      );
      setSelectedConversationId(newConversationId);
      setMessages([]);
      setShowHistory(false); // Close history when starting new conversation
    } catch (error) {
      console.error('Error creating new conversation:', error);
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!currentUser || !message.trim()) return;

    let conversationId = selectedConversationId;

    try {
      // If no conversation selected, create a new one
      if (!conversationId) {
        conversationId = await createAiConversation(
          currentUser.uid,
          generateConversationTitle(message)
        );
        setSelectedConversationId(conversationId);
      } else if (messages.length === 0) {
        // Update title for new conversations based on first message
        const title = generateConversationTitle(message);
        await updateAiConversationTitle(conversationId, title);
      }

      setIsSending(true);
      await sendAiMessage(conversationId, message);
    } catch (error: any) {
      console.error('Error sending message:', error);
      setIsSending(false);
      const errorMessage = error?.message || 'Failed to send message. Please try again.';
      alert(errorMessage);
    }
  };

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    setShowHistory(false); // Close history when conversation is selected
  };

  const handleToggleHistory = () => {
    setShowHistory(!showHistory);
  };

  if (!currentUser) {
    return (
      <aside className="ai-panel" aria-label="Assistant panel">
        <PuiStack
          sx={{
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
          }}
        >
          <p>Please sign in to use AI Assistant</p>
        </PuiStack>
      </aside>
    );
  }

  return (
    <aside className="ai-panel" aria-label="Assistant panel">
      <PuiStack
        sx={{
          height: '100%',
          overflow: 'hidden',
        }}
      >
        {showHistory ? (
          <AiConversationList
            conversations={conversations}
            selectedConversationId={selectedConversationId}
            onSelectConversation={handleSelectConversation}
            onNewConversation={handleNewConversation}
            onClose={() => setShowHistory(false)}
          />
        ) : (
          <AiChatView
            messages={messages}
            onSendMessage={handleSendMessage}
            isSending={isSending}
            conversationTitle={selectedConversation?.title}
            onShowHistory={handleToggleHistory}
            onNewConversation={handleNewConversation}
          />
        )}
      </PuiStack>
    </aside>
  );
}
