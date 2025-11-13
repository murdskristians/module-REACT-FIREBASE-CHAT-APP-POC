import {
  Colors,
  PuiAvatar,
  PuiBox,
  PuiButton,
  PuiIconButton,
  PuiMenuItem,
  PuiModal,
  PuiSelectV2,
  PuiStack,
  PuiStyled,
  PuiTextInput,
  PuiTypography,
} from 'piche.ui';

export const SectionContainer = PuiStyled(PuiBox)(({ theme }) => ({
  backgroundColor: 'white',
  borderRadius: '16px',
  border: `1px solid ${theme.palette.grey[50]}`,
  overflow: 'hidden',
}));

export const CoverImageWrapper = PuiStyled(PuiBox)(({ theme }) => ({
  height: '196px',
  overflow: 'hidden',
  background: theme.palette.grey[100],
  position: 'relative',
  '& img': {
    userSelect: 'none',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    objectFit: 'fill',
    objectPosition: 'center',
  },
}));

export const AvatarWrapper = PuiStyled(PuiBox)(() => ({
  display: 'flex',
  alignItems: 'flex-end',
  position: 'absolute',
  gap: '13px',
  bottom: '8px',
  left: '32px',
  zIndex: 3,
  borderRadius: '50%',
  '&:hover .avatar-backdrop': {
    opacity: 1,
    cursor: 'pointer',
  },
}));

export const StyledAvatar = PuiStyled(PuiAvatar)(({ theme }) => ({
  border: `2px solid ${theme.palette.common.white}`,
  fontSize: '20px',
  boxSizing: 'border-box',
}));

export const AvatarBackdrop = PuiStyled(PuiBox)(({ theme }) => ({
  width: '80px',
  height: '80px',
  backgroundColor: `rgba(0, 0, 0, 0.5)`,
  borderRadius: '50%',
  position: 'absolute',
  border: `2px solid ${theme.palette.common.white}`,
  opacity: 0,
  transition: 'opacity 300ms ease-in',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

export const Spinner = PuiStyled(PuiBox)(({ theme }) => ({
  width: '80px',
  height: '80px',
  backgroundColor: `rgba(0, 0, 0, 0.5)`,
  borderRadius: '50%',
  position: 'absolute',
  border: `2px solid ${theme.palette.common.white}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '&.rotate': {
    '& .MuiSvgIcon-root': {
      animation: 'spin 2s linear infinite',
      transformOrigin: 'center center',
    },
  },
  '@keyframes spin': {
    '0%': {
      transform: 'rotate(0deg)',
    },
    '100%': {
      transform: 'rotate(360deg)',
    },
  },
}));

export const NameWrapper = PuiStyled(PuiBox)(() => ({
  padding: '0 24px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
}));

export const ContactInformationTitle = PuiStyled(PuiBox)(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '16px',
  minHeight: '32px',
}));

export const AddressWrapper = PuiStyled(PuiBox)(() => ({
  marginTop: '16px',
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: '16px',
}));

export const SectionTitle = PuiStyled(PuiTypography)(() => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
}));

export const SocialMediaList = PuiStyled(PuiBox)(() => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(5, 1fr)',
  rowGap: '16px',
  columnGap: '16px',
}));

export const SocialMediaItemWrapper = PuiStyled(PuiBox)(({ theme }) => ({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  paddingRight: '16px',
  minWidth: '0',

  '&::after': {
    content: '""',
    width: '1px',
    height: '20px',
    backgroundColor: theme.palette.grey[50],
    position: 'absolute',
    right: '0',
    top: '50%',
    transform: 'translateY(-50%)',
  },

  '&:nth-of-type(5n)::after': {
    content: 'none',
  },
  '&.last-item::after': {
    content: 'none',
  },
  '& .MuiTypography-root': {
    gap: '8px',
    maxWidth: '121px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    '& .MuiBox-root': {
      padding: 0,
      backgroundColor: 'transparent',
      border: 'none',
      width: '24px',
      height: '24px',
    },
  },
}));

export const StyledInput = PuiStyled(PuiTextInput)(({ theme }) => ({
  width: '100%',
  '&.MuiInputBase-root fieldset': {
    borderColor: theme.palette.grey[50],
  },
  '&.MuiInputBase-root:hover fieldset': {
    borderColor: theme.palette.grey[100],
  },
  '&.MuiInputBase-root.Mui-focused fieldset': {
    borderColor: theme.palette.primary.main,
  },
  '&.MuiInputBase-root.Mui-disabled fieldset': {
    borderColor: theme.palette.grey[50],
  },
  '&.MuiInputBase-root .MuiInputBase-input': {
    padding: '10px 16px',
    backgroundColor: theme.palette.background.default,
    color: theme.palette.grey[500],
    fontSize: '12px',
    borderRadius: 'inherit',
  },
  '&.transparent-input.MuiInputBase-root': {
    '& .MuiInputBase-input': {
      backgroundColor: 'transparent',
    },
    '& fieldset': {
      borderColor: 'transparent',
    },
  },
  '&.MuiInputBase-root.Mui-focused fieldset, &.MuiInputBase-root:hover fieldset':
    {
      borderWidth: '1px',
    },
  "& input[type='number']::-webkit-inner-spin-button, & input[type='number']::-webkit-outer-spin-button":
    {
      margin: 0,
      WebkitAppearance: 'none',
    },
  "& input[type='number']": {
    MozAppearance: 'textfield',
  },
  '&.label': {
    maxWidth: '150px',
  },
}));

export const EditInfoItem = PuiStyled(PuiBox)(({ theme }) => ({
  '& .date-picker': {
    width: '100%',
    '& .MuiOutlinedInput-root': {
      borderRadius: '8px',
      backgroundColor: theme.palette.background.default,
    },
  },
}));

export const InfoItemLabel = PuiStyled(PuiTypography)(() => ({
  marginBottom: '4px',
}));

export const SelectMenuItem = PuiStyled(PuiMenuItem)(() => ({
  fontSize: '12px',
}));

export const ArrayEditableItemWrapper = PuiStyled(PuiBox)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  backgroundColor: theme.palette.background.default,
  marginBottom: '4px',
  border: `1px solid ${theme.palette.grey[50]}`,
  borderRadius: '8px',
  paddingLeft: '16px',
  '&:focus-within': {
    borderColor: theme.palette.primary.main,
  },
  '&.error': {
    borderColor: theme.palette.error.main,
  },
}));

export const ArrayRemoveButton = PuiStyled(PuiIconButton)(({ theme }) => ({
  backgroundColor: theme.palette.error.main,
  color: theme.palette.common.white,
  padding: '2px',
  borderRadius: '50%',
  '&:hover': {
    backgroundColor: theme.palette.error.dark,
  },
}));

export const AddItemButton = PuiStyled(PuiButton)(({ theme }) => ({
  marginTop: '16px',
  '&.MuiButton-sizeXsmall': {
    padding: '6.5px 20px',
    '& .MuiButton-startIcon': {
      borderRadius: '50%',
      padding: '4px',
      color: theme.palette.common.white,
      background: 'linear-gradient(112.78deg, #67D286 1.5%, #3C8D54 102.09%)',
      '& .MuiSvgIcon-root': {
        width: '12px',
        height: '12px',
      },
    },
  },
}));

export const LabelSelect = PuiStyled(PuiSelectV2)(() => ({
  fontSize: '12px',
  '&.transparent-select': {
    backgroundColor: 'transparent',
    border: 'none',
    minWidth: '108px',
    textAlign: 'right',
    marginRight: '16px',
    '&.MuiInputBase-root.Mui-focused': {
      backgroundColor: 'transparent',
    },
    '& .MuiSelect-select.MuiSelect-outlined.MuiInputBase-input.MuiOutlinedInput-input.MuiInputBase-inputSizeSmall':
      {
        paddingRight: '32px',
        justifyContent: 'flex-end',
      },
    '& fieldset.MuiOutlinedInput-notchedOutline': {
      border: 'none',
    },
    '& .MuiSvgIcon-root': {
      position: 'absolute',
      right: '0',
    },
  },
}));

export const CoverButton = PuiStyled(PuiButton)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
  color: theme.palette.grey[500],
  padding: '9px 16px',
  position: 'absolute',
  top: '16px',
  right: '16px',
}));

export const CoverMenuItem = PuiStyled(PuiMenuItem)(() => ({
  fontSize: '12px',
  lineHeight: 2,
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
}));

export const ProgressWrapper = PuiStyled(PuiBox)(({ theme }) => ({
  position: 'absolute',
  width: '100%',
  height: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  top: 0,
  left: 0,
  transform: 'none',
  zIndex: 2,
  '&::before': {
    content: "''",
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: theme.palette.primary.light,
    opacity: '0.5',
  },
}));

export const EditAddressFormWrapper = PuiStyled(PuiBox)(() => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: '16px',
  marginBottom: '32px',
}));

export const SocialMediaInputWrapper = PuiStyled(PuiBox)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  marginBottom: '16px',
  border: `1px solid ${theme.palette.grey[50]}`,
  borderRadius: '8px',
  padding: '0px 16px',
  backgroundColor: theme.palette.background.default,
  '&:focus-within': {
    borderColor: theme.palette.primary.main,
  },
  '&.error': {
    borderColor: theme.palette.error.main,
  },
}));

export const ModalSubtitle = PuiStyled(PuiStack)(({ theme }) => ({
  alignItems: 'center',
  [theme.breakpoints.down('sm')]: {
    alignItems: 'start',
  },
}));

export const StyledModal = PuiStyled(PuiModal)(({ theme }) => ({
  '.MuiBox-root': { maxWidth: '482px' },
  [theme.breakpoints.down('sm')]: {
    '.MuiBox-root': { padding: '24px', gap: '24px' },
    '.MuiDivider-root': { display: 'none' },
    '.MuiButton-root': { padding: '6.5px 16px' },
    '.modal-buttons': { gap: '16px', a: { marginLeft: 'auto' } },
  },
}));

export const ButtonWrapperStack = PuiStyled(PuiStack)(() => ({
  marginTop: '8px',
  '& .MuiButtonBase-root': {
    minWidth: '97px',
  },
}));

export const AlertWrapper = PuiStyled(PuiBox)(({ theme }) => ({
  width: '56px',
  height: '56px',
  display: 'flex',
  borderRadius: '50%',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: Colors.red[25],
  '& .MuiSvgIcon-root': {
    width: '24px',
    height: '24px',
    color: theme.palette.error.main,
  },
}));

export const ProfileMenuWrapper = PuiStyled(PuiBox)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  padding: '32px 24px 28px',
  borderRight: `1px solid ${theme.palette.grey[100]}`,
}));

export const ProfileMenuItemWrapper = PuiStyled(PuiBox)(({ theme }) => ({
  display: 'flex',
  padding: '12px',
  gap: '10px',
  borderRadius: '8px',
  marginBottom: '4px',
  '& .MuiTypography-root': {
    color: '#8A90A6',
  },
  '&.selected': {
    backgroundColor: '#E7F1FF',
    '& .MuiTypography-root': {
      color: '#20243B',
    },
  },
  '&:hover': {
    cursor: 'pointer',
    backgroundColor: '#F5F7FB',
  },
  '&.disabled': {
    cursor: 'default',
    pointerEvents: 'none',
    opacity: 0.9,
    '&:hover': {
      backgroundColor: 'transparent',
    },
  },
}));

export const LogoutButton = PuiStyled(PuiButton)(({ theme }) => ({
  backgroundColor: Colors.red[25],
  color: theme.palette.grey[600],
  justifyContent: 'flex-start',
  padding: '5px 16px',
  '&.MuiButton-sizeMedium .MuiButton-startIcon .MuiSvgIcon-root': {
    width: 'unset',
    height: 'unset',
  },
}));
