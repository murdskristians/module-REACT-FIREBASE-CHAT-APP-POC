import { PuiBox, PuiStyled, PuiSwitch } from 'piche.ui';

const transitionSettings = '0.3s ease';

export const ApplicationMenuBox = PuiStyled(PuiBox)(({ theme }) => ({
  minWidth: '75px',
  transition: transitionSettings,
  transform: 'translateX(-96px,0px)',
  borderRadius: '16px',
  position: 'relative',
  '&.collapsed': { minWidth: '0px' },
  '&.fixed': {
    backgroundColor: theme.palette.background.default,
    borderRight: `1px solid ${theme.palette.grey[50]}`,
    borderRadius: '16px 0 0 16px',
    transition: `background-color ${transitionSettings}`,
    '&:after': {
      content: '""',
      position: 'absolute',
      top: 0,
      right: '-21px',
      width: '20px',
      height: '100%',
      backgroundColor: theme.palette.background.paper,
    },
  },
}));

export const ApplicationMenuContainer = PuiStyled(PuiBox)(() => ({
  top: 0,
  left: 0,
  zIndex: 10,
  width: '4px',
  position: 'fixed',
}));

export const ApplicationMenuItemsWrapper = PuiStyled(PuiBox)(() => ({
  left: 0,
  bottom: 0,
  width: '75px',
  height: '100vh',
  minWidth: '4px',
  display: 'flex',
  overflow: 'hidden',
  position: 'relative',
  padding: '16px 0 20px',
  flexDirection: 'column',
  transform: 'translateX(-100%)',
  justifyContent: 'space-between',
  transition: `transform ${transitionSettings}`,
  paddingLeft: '5px',
  '&.expanded': { transform: 'translateX(0)' },
}));

export const MenuItems = PuiStyled(PuiBox)(() => ({
  gap: '16px',
  display: 'flex',
  alignItems: 'center',
  flexDirection: 'column',
}));

export const MenuItem = PuiStyled(PuiBox)(({ theme }) => ({
  position: 'relative',
  gap: '4px',
  width: '100%',
  display: 'flex',
  cursor: 'pointer',
  alignItems: 'center',
  flexDirection: 'column',
  '& .menu-item-icon': {
    width: '40px',
    height: '40px',
    fontSize: '16px',
    '&:hover': { outline: `2px solid ${theme.palette.grey[400]}` },
  },
  '&.fixed .menu-item-icon:hover': {
    outline: `2px solid ${theme.palette.grey[100]}`,
  },
  '&.active .menu-item-icon': {
    outline: `2px solid ${theme.palette.grey[400]}`,
  },
  '&.fixed.active .menu-item-icon': {
    outline: `2px solid ${theme.palette.grey[100]}`,
  },
  img: {
    width: '40px',
    height: '40px',
    borderRadius: '12px',
  },

  '& > .MuiTypography-root': {
    fontSize: '8px',
    fontWeight: 500,
    lineHeight: '1.6',
    textAlign: 'center',
    color: theme.palette.common.white,
    transition: `color ${transitionSettings}`,
  },
  '&.fixed > .MuiTypography-root': {
    color: theme.palette.grey[600],
  },
}));

export const NotificationBadge = PuiStyled(PuiBox)(({ theme }) => ({
  position: 'absolute',
  bottom: '17px',
  right: '13px',
  height: '16px',
  width: '16px',
  padding: '4px',
  backgroundColor: theme.palette.error.main,
  color: theme.palette.common.white,
  border: `1px solid ${theme.palette.grey[600]}`,
  transition: `border ${transitionSettings}`,
  borderRadius: '100px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  '&.light': {
    borderColor: theme.palette.background.paper,
  },
  '&.wide': {
    width: '18px',
  },
}));

export const IconBox = PuiStyled(PuiBox)(() => ({
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#323232',
}));

export const CustomSwitch = PuiStyled(PuiSwitch)<{ checked: boolean }>(({ checked, theme }) => ({
  cursor: 'pointer',
  '& .MuiSwitch-track': {
    backgroundColor: theme.palette.grey[300],
  },
  '& .MuiSwitch-thumb': {
    backgroundColor: checked ? theme.palette.background.paper : theme.palette.grey[600],
  },
}));
