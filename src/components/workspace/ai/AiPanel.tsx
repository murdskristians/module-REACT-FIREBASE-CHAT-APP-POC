import { PuiBox } from 'piche.ui';
import { FormEvent, useState } from 'react';

import { SendButton } from './SendButton';

export function AiPanel() {
  const [prompt, setPrompt] = useState('');
  const trimmedValue = prompt.trim();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!trimmedValue) return;
    // TODO: Handle AI message sending
    setPrompt('');
  };

  const sendMessage = () => {
    if (!trimmedValue) return;
    // TODO: Handle AI message sending
    setPrompt('');
  };

  return (
    <aside className="ai-panel" aria-label="Assistant panel">
      <header className="ai-panel__header">
        <h2>Q Assistant</h2>
        <p>Ask quick questions and get instant help.</p>
      </header>
      <div className="ai-panel__body">
        <div className="ai-panel__placeholder">
          <p>AI responses will appear here.</p>
        </div>
      </div>
      <form className="ai-panel__composer" onSubmit={handleSubmit}>
        <div className="ai-panel__input-box">
          <textarea
            placeholder="Message to Q Assistant"
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            className="ai-panel__textarea"
            rows={1}
          />
          <PuiBox display="flex" gap="8px">
            {trimmedValue ? <SendButton onClick={sendMessage} /> : null}
          </PuiBox>
        </div>
      </form>
    </aside>
  );
}

