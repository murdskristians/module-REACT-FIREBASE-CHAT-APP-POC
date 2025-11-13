import { PuiIcon, PuiSvgIcon } from 'piche.ui';

interface SendButtonProps {
  onClick: () => void;
}

export const SendButton = ({ onClick }: SendButtonProps) => {
  return (
    <button className="ai-panel__send-button" onClick={onClick}>
      <PuiSvgIcon width={16} height={16} icon={PuiIcon.Send} />
    </button>
  );
};
