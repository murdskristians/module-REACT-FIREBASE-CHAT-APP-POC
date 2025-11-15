import { PuiBox, PuiStack, PuiStyled } from 'piche.ui';

export const StyledPinnedMessages = PuiStyled(PuiStack)(({ theme }) => ({
  flexDirection: 'row',
  padding: '4px 32px',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderTop: `1px solid ${theme.palette.grey[200]}`,
  borderBottom: `1px solid ${theme.palette.grey[200]}`,
  borderLeft: 'none',
  borderRight: 'none',
  background: theme.palette.common.white,
  cursor: 'pointer',
  position: 'absolute',
  top: '64px',
  left: 0,
  right: 0,
  zIndex: 9,
  gap: 8,

  '&:hover': {
    background: theme.palette.background.default,
  },
}));

export const StyledPinnedBarsContainer = PuiStyled(PuiStack)(() => ({
  minWidth: 2,
  height: 44,
  gap: 4,
  overflow: 'hidden',
  flexDirection: 'column',
  justifyContent: 'flex-end',
}));

export const StyledPinnedBar = PuiStyled(PuiBox, {
  shouldForwardProp: propName => propName !== 'isActive',
})<{ isActive: boolean }>(({ theme, isActive }) => ({
  width: 2,
  minHeight: 8,
  borderRadius: '1px',
  backgroundColor: isActive ? theme.palette.primary.main : theme.palette.grey[200],
  transition: 'background-color 0.2s ease',
}));

