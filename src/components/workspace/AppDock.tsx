import type firebaseCompat from 'firebase/compat/app';
import { MenuItem } from './StyledComponents';
import { PuiAvatar, type PuiContact, PuiTypography } from 'piche.ui';
import chatIcon from './chat.svg';
import { useTheme } from '../../hooks/useTheme';

type ActiveApp = 'chat' | 'profile';

type AppDockProps = {
  user: firebaseCompat.User;
  activeApp: ActiveApp;
  onSelectApp: (app: ActiveApp) => void;
  onOpenProfile: () => void;
};

export function AppDock({
  user,
  activeApp,
  onSelectApp,
  onOpenProfile,
}: AppDockProps) {
  const displayName = user.displayName ?? user.email ?? 'User';
  const { isDark, toggleTheme } = useTheme();

  const profileContact: PuiContact = {
    id: user.uid,
    name: displayName,
    email: user.email ?? undefined,
    avatarUrl: user.photoURL ?? undefined,
  } as PuiContact;

  return (
    <aside className="dock">
      <button
        onClick={toggleTheme}
        className="dock__theme-toggle"
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      >
        {isDark ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6C8.68629 6 6 8.68629 6 12C6 15.3137 8.68629 18 12 18Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 2V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 20V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M4.92993 4.92993L6.33993 6.33993" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M17.66 17.66L19.07 19.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M20 12H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M6.33993 17.66L4.92993 19.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M19.07 4.92993L17.66 6.33993" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </button>

      <nav className="dock__nav" aria-label="Applications">
        <MenuItem
          onClick={() => onSelectApp('chat')}
          className={`dock__chat-menu ${activeApp === 'chat' ? 'active' : ''}`}
        >
          <img className="menu-item-icon" src={chatIcon} alt="" />
          <PuiTypography variant="body-xs-semibold">Chat</PuiTypography>
        </MenuItem>
      </nav>

      <MenuItem
        onClick={onOpenProfile}
        className={`dock__profile-item ${
          activeApp === 'profile' ? 'active' : ''
        }`}
      >
        <PuiAvatar className="menu-item-icon" contact={profileContact} />
        <PuiTypography variant="body-sm-regular">{displayName}</PuiTypography>
      </MenuItem>
    </aside>
  );
}
