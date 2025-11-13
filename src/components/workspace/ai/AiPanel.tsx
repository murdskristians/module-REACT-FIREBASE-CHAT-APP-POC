import { FormEvent, useState } from 'react';

export function AiPanel() {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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
        <input
          type="text"
          placeholder="Message to Q Assistant"
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
        />
        <button type="submit">Send</button>
      </form>
    </aside>
  );
}

