import { PuiBox, PuiList, PuiListItemButton, PuiMenu, PuiPopover, PuiStack, PuiSvgIcon, PuiStyled } from 'piche.ui';

export const MessageContextMenuPopup = PuiStyled(PuiMenu, {
  shouldForwardProp: propName => propName !== 'horizontal',
})<{ horizontal: 'right' | 'left' }>(({ theme, horizontal }) => ({
  transform: 'none',
  '& .MuiBackdrop-root': {
    backgroundColor: theme.palette.background.default,
  },
  '& .MuiPaper-root': {
    backgroundColor: theme.palette.background.paper,
    transform: horizontal === 'right' ? 'translate(-28px, -7.5px)' : 'translate(28px, -7.5px)',
    overflow: 'unset',
  },
  '& .MuiList-root': {
    boxShadow: 'none',
    border: 'none',
    padding: 0,
    gap: 0,
    width: 'auto',
  },
}));

export const MessageReactionsListWrapper = PuiStyled(PuiBox)(({ theme }) => ({
  '& .EmojiPickerReact': {
    backgroundColor: theme.palette.background.default,
    boxShadow: '0px 5px 40px 0px rgba(0, 0, 0, 0.10)',
    borderRadius: '20px',
    border: `1px solid ${theme.palette.grey[50]}`,
  },
  '& .EmojiPickerReact ul': {
    padding: '8px 16px',
    gap: '7px',
  },
  '& .EmojiPickerReact button, .EmojiPickerReact img': {
    width: '24px',
    height: '24px',
    minWidth: '24px',
    minHeight: '24px',
    padding: 0,
  },
  '& .EmojiPickerReact button': {
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    overflow: 'unset',
  },
}));

export const ReactionIconWrapper = PuiStyled(PuiBox, {
  shouldForwardProp: propName => propName !== 'isOpened',
})<{ isOpened: boolean }>(({ isOpened, theme }) => ({
  width: '20px',
  height: '20px',
  cursor: 'pointer',
  position: 'relative',
  flexShrink: 0,
  alignSelf: 'flex-end',
  marginTop: '8px',
  '& .reaction-icon': {
    width: '20px',
    height: '20px',
    transition: 'opacity 0.2s ease',
    opacity: 0,
    stroke: theme.palette.grey[100],
  },
  '&:hover .reaction-icon': {
    opacity: 1,
    stroke: theme.palette.grey[300],
  },
}));

export const StyledMessagePopup = PuiStyled(PuiPopover)(() => ({
  '& .MuiPaper-root': {
    backgroundColor: 'transparent',
    overflow: 'visible',
  },
}));

export const StyledMessagePopupListWrapper = PuiStyled(PuiBox)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
  borderRadius: '4px',
  border: `1px solid ${theme.palette.grey[50]}`,
  boxShadow: '0px 7px 10.4px 0px rgba(0, 0, 0, 0.03)',
  transition: '0.2s',
  '& .MuiListItemIcon-root': {
    minWidth: 'inherit',
  },
}));

export const StyledMessagePopupList = PuiStyled(PuiList)(() => ({
  padding: '8px 4px',
}));

export const StyledMessagePopupListItem = PuiStyled(PuiListItemButton)(({ theme }) => ({
  gap: '8px',
  padding: '6px 8px',
  cursor: 'pointer',
  borderRadius: '4px',
  '& .MuiListItemText-primary': {
    fontSize: '12px',
  },
  '&:hover': {
    backgroundColor: theme.palette.background.default,
  },
  '&.delete': {
    'svg, .MuiListItemText-primary': {
      color: theme.palette.error.dark,
    },
    '&:hover': {
      'svg, .MuiListItemText-primary': {
        color: theme.palette.error.main,
      },
    },
  },
}));

export const StyledIconWrapper = PuiStyled(PuiSvgIcon, {
  shouldForwardProp: propName => propName !== 'isContextMenuOpened',
})<{ isContextMenuOpened: boolean }>(({ isContextMenuOpened, theme }) => ({
  flexShrink: 0,
  alignSelf: 'flex-start',
  marginTop: '4px',
  stroke: isContextMenuOpened ? theme.palette.primary.main : theme.palette.grey[600],
  cursor: 'pointer',
  transition: 'opacity 0.2s ease',
  opacity: 0,
}));

export const StyledConversationMessageWrapper = PuiStyled(PuiBox, {
  shouldForwardProp: propName => propName !== 'isUserMessage',
})<{ isUserMessage?: boolean }>(({ isUserMessage }) => ({
  width: '100%',
  position: 'relative',
  display: 'flex',
  justifyContent: isUserMessage ? 'flex-end' : 'flex-start',
  padding: '4px 0',
  transition: 'padding-left 0.2s ease-out',
}));

export const StyledMessageCardWrapper = PuiStyled(PuiBox)(() => ({
  position: 'relative',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'flex-start',
  gap: '8px',
  '&:hover .message-dots-menu': {
    opacity: 1,
  },
}));

export const StyledConversationMessageContent = PuiStyled(PuiBox)(() => ({
  gap: '8px',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'flex-start',
  transition: 'min-height 0.3s ease-in-out, height 0.3s ease-in-out',
  minHeight: 'auto',
  maxWidth: 'calc(100% - 64px)',
  width: '100%',
  position: 'relative',
}));

export const StyledStack = PuiStyled(PuiStack)({
  flexDirection: 'row',
  gap: 8,
  alignItems: 'center',
  padding: '6px 8px',
  '& .MuiListItemText-primary': {
    fontSize: '12px',
  },
});

