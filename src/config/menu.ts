import { PuiIcon } from 'piche.ui';

export const menuList = [
  { title: 'Personal information', path: '/personal-information', icon: PuiIcon.User3, enabled: true },
  { title: 'Password & Security', path: '/password-security', icon: PuiIcon.ShieldTick, enabled: false },
  { title: 'Appearance & Theme', path: '/appearance-theme', icon: PuiIcon.Palette, enabled: true },
  { title: 'General Preferences', path: '/general-preferences', icon: PuiIcon.LayersThree, enabled: true },
  { title: 'Connected Apps', path: '/connected-apps', icon: PuiIcon.Grid, enabled: true },
  { title: 'Notifications', path: '/notifications', icon: PuiIcon.Bell, enabled: true },
  { title: 'API Token', path: '/api-token', icon: PuiIcon.CodeSnippet, enabled: true },
];
