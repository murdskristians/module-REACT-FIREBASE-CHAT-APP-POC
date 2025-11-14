import type firebaseCompat from 'firebase/compat/app';
import { MenuItem } from './StyledComponents';
import { PuiAvatar, type PuiContact, PuiTypography } from 'piche.ui';
import chatIcon from './chat.svg';

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

  const profileContact: PuiContact = {
    id: user.uid,
    name: displayName,
    email: user.email ?? undefined,
    avatarUrl: user.photoURL ?? undefined,
  } as PuiContact;

  return (
    <aside className="dock">
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
