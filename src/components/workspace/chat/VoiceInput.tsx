import { PuiIcon, PuiSvgIcon } from 'piche.ui';
import { useState } from 'react';

export function VoiceInput() {
  const [recordOptionsOpen, setRecordOptionsOpen] = useState(false);

  return (
    <div
      className={`voice-input-container${recordOptionsOpen ? ' active' : ''}`}
    >
      <button
        type="button"
        className="voice-input-mic"
        aria-label="Voice message"
        title="Voice message"
      >
        <PuiSvgIcon
          width={16}
          height={16}
          icon={PuiIcon.Microphone}
        />
      </button>
      <button
        type="button"
        className={`voice-input-chevron${recordOptionsOpen ? ' active' : ''}`}
        onClick={() => setRecordOptionsOpen(!recordOptionsOpen)}
        aria-label="Voice options"
        title="Voice recording options"
      >
        <PuiSvgIcon
          width={14}
          height={24}
          icon={recordOptionsOpen ? PuiIcon.ChevronUp : PuiIcon.ChevronDown}
        />
      </button>
    </div>
  );
}
