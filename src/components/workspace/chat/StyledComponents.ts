import { PuiBox, PuiDivider, PuiIconButton, PuiStack, PuiStyled, PuiTypography } from 'piche.ui';

export const ChatAreaWrapper = PuiStyled(PuiStack)(() => ({
  height: '100%',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
}));

export const StyledTopBar = PuiStyled(PuiStack)(({ theme }) => ({
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '16px 32px',
  backgroundColor: theme.palette.common.white,
  height: 64,
  zIndex: 1,
}));

export const StyledTopBarButton = PuiStyled(PuiIconButton)(({ theme }) => ({
  borderRadius: '50%',
  padding: 0,
  width: '40px',
  height: '40px',
  svg: {
    color: theme.palette.grey[400],
  },
  '&.MuiButtonBase-root': {
    background: theme.palette.background.default,
  },
  '&.MuiButtonBase-root:hover': {
    backgroundColor: theme.palette.grey[50],
    svg: {
      color: theme.palette.primary.main,
    },
  },
  '&.contained': {
    background: 'var(--palette-gradient)',
    svg: {
      color: theme.palette.common.white,
    },
    '&:hover': {
      opacity: 0.9,
    },
  },
}));

export const MessagesContainer = PuiStyled(PuiStack)(() => ({
  flexGrow: 1,
  overflow: 'auto',
  zIndex: 0,
}));

export const ConversationInfoWrapper = PuiStyled(PuiBox)({
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  minWidth: 0,
});

export const StyledConversationTitle = PuiStyled(PuiTypography)(({ theme }) => ({
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: '14px',
  lineHeight: 1.6,
  '&:hover': { color: theme.palette.grey[400] },
  textOverflow: 'ellipsis',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
}));

export const StyledDivider = PuiStyled(PuiDivider)(() => ({
  width: '100%',
}));

export const StyledInputWrapper = PuiStyled(PuiStack)(() => ({
  margin: '0 32px 20px 32px',
  gap: '8px',
  position: 'relative',
}));

export const StyledConversationInput = PuiStyled(PuiBox)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  border: `1px solid ${theme.palette.grey[50]}`,
  borderRadius: '12px',
  '&.active': {
    border: `1px solid ${theme.palette.grey[100]}`,
  },
}));

export const StyledInputBox = PuiStyled(PuiStack)(() => ({
  flexDirection: 'row',
  gap: '12px',
  padding: '12px 16px',
  alignItems: 'center',
  justifyContent: 'space-between',
}));
