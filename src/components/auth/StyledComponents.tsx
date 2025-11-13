import { PuiBox, PuiFormGroup, PuiStack, PuiStyled } from 'piche.ui';

interface RegistrationFormGroupProps {
  isShort: boolean;
}

export const LogoBox = PuiStyled(PuiBox)(({ theme }) => ({
  display: 'none',
  [theme.breakpoints.down('md')]: {
    display: 'block',
  },
}));

export const RegistrationStack = PuiStyled(PuiStack)(({ theme }) => ({
  flexWrap: 'wrap',
  gap: '24px',
  flexDirection: 'row',

  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    flexWrap: 'no-wrap',
  },
}));

export const RegistrationFormGroup = PuiStyled(PuiFormGroup, {
  shouldForwardProp: prop => prop !== 'isShort',
})<RegistrationFormGroupProps>(({ isShort, theme }) => ({
  width: isShort ? '210px' : '100%',

  [theme.breakpoints.down('md')]: {
    width: '100%',
  },
}));
