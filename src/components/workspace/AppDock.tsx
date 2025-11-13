import type firebaseCompat from 'firebase/compat/app';

type DockItemId = 'spreadsheets' | 'chat' | 'contacts';

type AppDockProps = {
  user: firebaseCompat.User;
  activeApp: 'chat' | 'profile';
  onSelectApp: (appId: DockItemId) => void;
  onOpenProfile: () => void;
};

const DOCK_ITEMS: Array<{ id: DockItemId; label: string; icon: string }> = [
  { id: 'spreadsheets', label: 'Spreadsheets', icon: '📊' },
  { id: 'chat', label: 'Chat', icon: '💬' },
  { id: 'contacts', label: 'Contacts', icon: '👥' },
];

export function AppDock({ user, activeApp, onSelectApp, onOpenProfile }: AppDockProps) {
  const initials = (user.displayName ?? user.email ?? 'User')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <aside className="dock">
      <div className="dock__logo">PC</div>
      <nav className="dock__nav" aria-label="Applications">
        {DOCK_ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`dock__item ${
              item.id === 'chat' && activeApp === 'chat' ? 'dock__item--active' : ''
            }`}
            aria-pressed={item.id === 'chat' && activeApp === 'chat'}
            onClick={() => onSelectApp(item.id)}
          >
            <span aria-hidden="true" className="dock__item-icon">
              {item.icon}
            </span>
            <span className="sr-only">{item.label}</span>
          </button>
        ))}
      </nav>
      <button
        type="button"
        className={`dock__user ${activeApp === 'profile' ? 'dock__user--active' : ''}`}
        onClick={onOpenProfile}
        title="View profile"
      >
        {user.photoURL ? (
          <img src={user.photoURL} alt={user.displayName ?? 'Current user'} />
        ) : (
          <span>{initials}</span>
        )}
        <span className="dock__status-indicator" aria-hidden="true" />
      </button>
    </aside>
  );
}

