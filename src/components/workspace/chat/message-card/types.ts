import type { PuiIcon } from 'piche.ui';

export interface MessagePopupItemType {
  label: string;
  icon?: PuiIcon;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  children?: MessagePopupItemType[];
}

