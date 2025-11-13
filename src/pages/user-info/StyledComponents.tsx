import { PuiStack, PuiStyled } from 'piche.ui';

export const MainPanel = PuiStyled(PuiStack)(({ theme }) => ({
  flex: 1,
  height: '100%',
  width: '100%',
  overflow: 'hidden',
  position: 'relative',
  backgroundColor: theme.palette.background.default,
  borderRadius: '16px',
  display: 'grid',
  gridTemplateColumns: '316px 1fr',
}));
