import { PuiListItem, PuiListItemIcon, PuiListItemText, PuiSvgIcon } from 'piche.ui';
import type { FC } from 'react';

import { StyledMessagePopupListItem } from './StyledComponents';
import type { MessagePopupItemType } from './types';

interface ConversationMessagePopupItemProps {
  option: MessagePopupItemType;
  onClick: React.MouseEventHandler;
}

export const ConversationMessagePopupItem: FC<ConversationMessagePopupItemProps> = ({ option, onClick }) => {
  return (
    <PuiListItem disablePadding>
      <StyledMessagePopupListItem
        className={option.className}
        onClick={onClick}
        disabled={option.disabled}
      >
        {option.icon && (
          <PuiListItemIcon>
            <PuiSvgIcon
              icon={option.icon}
              width={16}
              height={16}
            />
          </PuiListItemIcon>
        )}
        <PuiListItemText
          primary={option.label}
          primaryTypographyProps={{ 
            variant: 'body-sm-regular',
            sx: { 
              fontSize: '12px',
              ...(option.className === 'delete' ? { color: 'error.dark' } : {})
            }
          }}
        />
      </StyledMessagePopupListItem>
    </PuiListItem>
  );
};

