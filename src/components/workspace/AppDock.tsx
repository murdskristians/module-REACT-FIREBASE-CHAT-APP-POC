import type firebaseCompat from 'firebase/compat/app';

type AppDockProps = {
  user: firebaseCompat.User;
  onSignOut: () => Promise<void> | void;
};

const DOCK_ITEMS = [
  { id: 'spreadsheets', label: 'Spreadsheets', icon: '📊' },
  { id: 'chat', label: 'Chat', icon: '💬', active: true },
  { id: 'contacts', label: 'Contacts', icon: '👥' },
];

export function AppDock({ user, onSignOut }: AppDockProps) {
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
            className={`dock__item ${item.active ? 'dock__item--active' : ''}`}
            aria-pressed={item.active ?? false}
          >
            <span aria-hidden="true" className="dock__item-icon">
              {item.icon}
            </span>
            <span className="sr-only">{item.label}</span>
          </button>
        ))}
      </nav>
      <button type="button" className="dock__user" onClick={onSignOut} title="Sign out">
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

