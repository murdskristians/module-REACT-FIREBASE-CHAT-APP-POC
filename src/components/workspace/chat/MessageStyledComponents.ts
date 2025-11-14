import { PuiBox, PuiStyled, PuiTypography } from 'piche.ui';

export const StyledMessageTextWrapper = PuiStyled(PuiBox)(() => ({
  width: 'max-content',
  flexWrap: 'wrap',
  minWidth: '100%',
  maxWidth: '100%',
  marginRight: 'auto',
  whiteSpace: 'normal',
}));

export const StyledTextContent = PuiStyled(PuiTypography)(({ theme }) => ({
  wordBreak: 'break-word',
  whiteSpace: 'pre-wrap',
  display: 'inline',
  fontSize: '13px',
  lineHeight: 1.6,
  fontFamily: "'Poppins', 'Inter', sans-serif",
  '& .mention': {
    color: theme.palette.primary.main,
    fontSize: '13px',
    fontStyle: 'normal',
    fontWeight: 700,
    lineHeight: '160%',
    letterSpacing: '0.2px',
    display: 'inline-block',
    borderRadius: '4px',
    backgroundColor: theme.palette.primary.light,
    cursor: 'pointer',
  },
}));

export const StyledMessageStatus = PuiStyled(PuiBox, {
  shouldForwardProp: (prop) => prop !== 'isFileMessage',
})<{ isFileMessage?: boolean }>(({ isFileMessage }) => ({
  height: '20px',
  position: 'relative',
  top: '8px',
  right: isFileMessage ? '0' : '0px',
  marginLeft: '8px',
  display: 'inline-flex',
  float: 'right',
  gap: '4px',
  alignItems: 'flex-end',
  color: '#939393',
  fontSize: '11px',
  whiteSpace: 'nowrap',
  fontFamily: "'Poppins', 'Inter', sans-serif",
}));
