import { PuiBox, PuiStyled, PuiTypography } from 'piche.ui';

export const StyledReply = PuiStyled(PuiBox)(({ theme }) => ({
  padding: '12px',
  borderRadius: '8px',
  backgroundColor: theme.palette.grey[50],
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  maxWidth: '100%',
  flexGrow: 1,
  cursor: 'pointer',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '3px',
    backgroundColor: theme.palette.primary.main,
  },
}));

export const StyledReplyContent = PuiStyled(PuiBox)(() => ({
  display: 'flex',
  gap: '8px',
  justifyContent: 'space-between',
  maxWidth: '100%',
}));

export const StyledReplyName = PuiStyled(PuiTypography)(({ theme }) => ({
  color: theme.palette.primary.main,
  fontSize: '13px',
  fontWeight: 500,
  marginBottom: '4px',
}));

export const StyledReplyText = PuiStyled(PuiTypography)(({ theme }) => ({
  fontSize: '13px',
  color: theme.palette.grey[700],
  fontWeight: 400,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  maxWidth: '100%',
}));

export const StyledReplyImage = PuiStyled(PuiBox)(() => ({
  width: '46px',
  height: '46px',
  borderRadius: '8px',
  overflow: 'hidden',
  flexShrink: 0,
  '& img': {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
}));

export const ReplyContainer = PuiStyled(PuiBox)(() => ({
  maxWidth: '100%',
  width: '100%',
  flexShrink: 0,
}));

