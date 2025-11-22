import { PuiBox, PuiStyled, PuiTypography } from 'piche.ui';

export const StyledMessageTextWrapper = PuiStyled(PuiBox)(() => ({
  width: '100%',
  flexWrap: 'wrap',
  minWidth: 0,
  maxWidth: '100%',
  marginRight: 'auto',
  whiteSpace: 'normal',
  wordBreak: 'break-word',
  overflowWrap: 'break-word',
}));

export const StyledTextContent = PuiStyled(PuiTypography)(({ theme }) => ({
  wordBreak: 'break-word',
  overflowWrap: 'break-word',
  whiteSpace: 'pre-wrap',
  display: 'block',
  fontSize: '13px',
  lineHeight: 1.5,
  fontFamily: "'Poppins', 'Inter', sans-serif",
  maxWidth: '100%',
  minWidth: 0,
  width: '100%',
  hyphens: 'auto',
  '@media (max-width: 768px)': {
    fontSize: '12px',
    lineHeight: 1.4,
  },
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
    '@media (max-width: 768px)': {
      fontSize: '12px',
    },
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
