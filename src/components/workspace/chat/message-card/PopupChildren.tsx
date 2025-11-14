import { PuiDivider, PuiIcon, PuiListItem, PuiListItemIcon, PuiListItemText, PuiSvgIcon } from 'piche.ui';
import type { FC } from 'react';

import { StyledMessagePopupList, StyledMessagePopupListItem, StyledStack } from './StyledComponents';
import type { MessagePopupItemType } from './types';

interface PopupChildrenProps {
  activeOption: MessagePopupItemType;
  handleBack: () => void;
}

export const PopupChildren: FC<PopupChildrenProps> = ({ activeOption, handleBack }) => {
  return (
    <StyledMessagePopupList>
      <PuiListItem disablePadding>
        <StyledStack>
          {activeOption.icon && (
            <PuiListItemIcon>
              <PuiSvgIcon
                icon={activeOption.icon}
                width={16}
                height={16}
              />
            </PuiListItemIcon>
          )}
          <PuiListItemText
            primary={activeOption.label}
            primaryTypographyProps={{ variant: 'body-sm-regular', sx: { fontSize: '12px' } }}
          />
        </StyledStack>
      </PuiListItem>
      {activeOption.children?.map(item => (
        <PuiListItem
          key={item.label}
          disablePadding
        >
          <StyledMessagePopupListItem onClick={item.onClick}>
            <PuiListItemText
              primary={item.label}
              primaryTypographyProps={{ variant: 'body-sm-regular', sx: { fontSize: '12px' } }}
            />
          </StyledMessagePopupListItem>
        </PuiListItem>
      ))}
      <PuiDivider sx={{ margin: '6px 0 ' }} />
      <PuiListItem disablePadding>
        <StyledMessagePopupListItem onClick={handleBack}>
          <PuiListItemIcon>
            <PuiSvgIcon
              icon={PuiIcon.ArrowLeft}
              width={16}
              height={16}
            />
          </PuiListItemIcon>
          <PuiListItemText
            primary='back'
            primaryTypographyProps={{ variant: 'body-sm-regular', sx: { fontSize: '12px' } }}
          />
        </StyledMessagePopupListItem>
      </PuiListItem>
    </StyledMessagePopupList>
  );
};

