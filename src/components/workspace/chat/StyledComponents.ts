import { PuiBox, PuiIconButton, PuiStack, PuiStyled, PuiTypography } from 'piche.ui';

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
  backgroundColor: 'var(--bg-primary, ' + theme.palette.common.white + ')',
  height: 64,
  zIndex: 1,
}));

export const StyledTopBarButton = PuiStyled(PuiIconButton)(({ theme }) => ({
  borderRadius: '50%',
  padding: 0,
  width: '40px',
  height: '40px',
  svg: {
    color: 'var(--text-secondary, ' + theme.palette.grey[400] + ')',
  },
  '&.MuiButtonBase-root': {
    background: 'var(--bg-tertiary, ' + theme.palette.background.default + ')',
  },
  '&.MuiButtonBase-root:hover': {
    backgroundColor: 'var(--bg-secondary, ' + theme.palette.grey[50] + ')',
    svg: {
      color: 'var(--palette-primary, ' + theme.palette.primary.main + ')',
    },
  },
  '&.contained': {
    background: 'var(--palette-call-button)',
    svg: {
      color: theme.palette.common.white,
    },
    '&.MuiButtonBase-root:hover': {
      backgroundColor: 'var(--palette-call-button)',
      svg: {
        color: theme.palette.common.white,
      },
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

export const StyledInputWrapper = PuiStyled(PuiStack)(() => ({
  margin: '0 32px 20px 32px',
  gap: '8px',
  position: 'relative',
}));

export const StyledConversationInput = PuiStyled(PuiBox)(({ theme }) => ({
  backgroundColor: 'var(--bg-tertiary, ' + theme.palette.background.default + ')',
  border: '1px solid var(--border-color, ' + theme.palette.grey[50] + ')',
  borderRadius: '12px',
  '&.active': {
    border: '1px solid var(--palette-primary, ' + theme.palette.grey[100] + ')',
  },
}));

export const StyledInputBox = PuiStyled(PuiStack)(() => ({
  flexDirection: 'row',
  gap: '12px',
  padding: '12px 16px',
  alignItems: 'center',
  justifyContent: 'space-between',
}));

export const StyledConversationAvatar = PuiStyled(PuiBox)(() => ({
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 600,
  fontSize: '13px',
  color: '#1f2131',
  overflow: 'hidden',
  flexShrink: 0,
  '& img': {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
}));

export const StyledConversationSubtitle = PuiStyled(PuiTypography)(() => ({
  textOverflow: 'ellipsis',
  overflow: 'hidden',
  fontSize: '12px',
  fontWeight: 500,
  lineHeight: 1.6,
}));

export const StyledEmojiButton = PuiStyled('button')(({ theme }) => ({
  cursor: 'pointer',
  width: '24px',
  height: '24px',
  background: 'transparent',
  border: 'none',
  padding: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--text-secondary, #a0a0a0)',
  borderRadius: '50%',
  transition: 'background-color 0.2s ease',
  '&:hover, &.menu-is-open': {
    backgroundColor: 'var(--bg-tertiary, ' + theme.palette.grey[50] + ')',
  },
  '& svg': {
    color: 'var(--text-secondary, #a0a0a0)',
  },
  '&:hover svg, &.menu-is-open svg': {
    color: 'var(--text-secondary, ' + theme.palette.grey[600] + ')',
  },
}));

export const StyledEmojiWrapper = PuiStyled(PuiBox)(({ theme }) => ({
  '& .epr-main': {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    border: 'none',
    borderRadius: 8,
    boxShadow: '0px -4px 12px 0px rgba(0, 0, 0, 0.05), -4px 8px 16px -2px rgba(27, 33, 44, 0.12)',
    zIndex: 10000,
    backgroundColor: 'var(--bg-primary, ' + theme.palette.common.white + ')',
    '&::-webkit-scrollbar': {
      width: '8px !important',
    },
    '&::-webkit-scrollbar-track': {
      background: 'var(--bg-primary, ' + theme.palette.background.default + ') !important',
    },
    '&::-webkit-scrollbar-thumb': {
      background: '#4B5563 !important',
      borderRadius: '4px !important',
    },
    '&::-webkit-scrollbar-thumb:hover': {
      background: '#6B7280 !important',
    },
    '& .epr-header': {
      position: 'initial !important',
      '& > div:first-of-type': {
        padding: 16,
        '& input': {
          padding: '0 16px 0 40px',
          borderRadius: 4,
          backgroundColor: 'var(--bg-tertiary, ' + theme.palette.background.default + ')',
          borderColor: 'var(--border-color, ' + theme.palette.background.default + ')',
          color: 'var(--text-primary, ' + theme.palette.grey[600] + ')',
          fontFamily: 'Poppins, Inter, sans-serif',
          fontSize: 12,
          fontWeight: 500,
          lineHeight: '160%',
          transition: 'border-color 0.2s ease',
          '&:focus': {
            borderColor: 'var(--border-color, ' + theme.palette.grey[100] + ')',
            outline: 'none',
          },
          '&::placeholder': {
            color: 'var(--text-secondary, ' + theme.palette.grey[400] + ')',
          },
        },
        '& .epr-icn-search': {
          left: 16,
          '& svg': {
            fill: 'var(--text-secondary, ' + theme.palette.grey[400] + ')',
          },
        },
      },
      '& .epr-category-nav': {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        background: 'var(--bg-primary, ' + theme.palette.background.default + ')',
        padding: '12px 16px',
        zIndex: 5,
        opacity: '1 !important',
        '& button': {
          '& svg': {
            fill: 'var(--text-secondary, ' + theme.palette.grey[400] + ')',
          },
          '&.epr-cat-btn.epr-active': {
            '& svg': {
              fill: 'var(--palette-primary, ' + theme.palette.primary.main + ')',
            },
          },
        },
      },
    },
    '& .epr-body': {
      '&::-webkit-scrollbar': {
        width: '8px !important',
      },
      '&::-webkit-scrollbar-track': {
        background: 'var(--bg-primary, ' + theme.palette.background.default + ') !important',
      },
      '&::-webkit-scrollbar-thumb': {
        background: '#4B5563 !important',
        borderRadius: '4px !important',
      },
      '&::-webkit-scrollbar-thumb:hover': {
        background: '#6B7280 !important',
      },
    },
    '& .epr-emoji-list': {
      marginBottom: 72,
      '&::-webkit-scrollbar': {
        width: '8px !important',
      },
      '&::-webkit-scrollbar-track': {
        background: 'var(--bg-primary, ' + theme.palette.background.default + ') !important',
      },
      '&::-webkit-scrollbar-thumb': {
        background: '#4B5563 !important',
        borderRadius: '4px !important',
      },
      '&::-webkit-scrollbar-thumb:hover': {
        background: '#6B7280 !important',
      },
      '& .epr-emoji-category-content': {
        gridTemplateColumns: 'repeat(auto-fill, 28px)',
        gap: 84,
        margin: '16px 4px 16px 16px',
        '& .epr-btn': {
          maxWidth: 28,
          maxHeight: 28,
          minWidth: 28,
          minHeight: 28,
          padding: 4,
          '& .epr-emoji-img': {
            maxWidth: 28,
            maxHeight: 28,
            minWidth: 28,
            minHeight: 28,
            padding: 0,
          },
        },
      },
      '& .epr-emoji-category-label': {
        color: 'var(--text-secondary, ' + theme.palette.grey[600] + ')',
        backgroundColor: 'var(--bg-primary, ' + theme.palette.common.white + ')',
        fontFamily: 'Poppins, Inter, sans-serif',
        fontSize: 12,
        fontWeight: 500,
        lineHeight: '160%',
        height: 'auto',
        padding: '0 16px',
      },
    },
  },
}));