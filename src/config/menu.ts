import { PuiIcon } from 'piche.ui';

export const menuList = [
  { title: 'Personal information', path: '/personal-information', icon: PuiIcon.User3, enabled: true },
  { title: 'Password & Security', path: '/password-security', icon: PuiIcon.ShieldTick, enabled: false },
  { title: 'General Preferences', path: '/general-preferences', icon: PuiIcon.LayersThree, enabled: false },
  { title: 'Connected Apps', path: '/connected-apps', icon: PuiIcon.Grid, enabled: false },
  { title: 'Notification', path: '/notification', icon: PuiIcon.Bell, enabled: false },
  { title: 'API Token', path: '/api-token', icon: PuiIcon.CodeSnippet, enabled: false },
];
