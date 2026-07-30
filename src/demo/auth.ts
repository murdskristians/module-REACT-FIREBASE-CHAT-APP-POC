/**
 * Offline stand-in for firebase.auth().
 *
 * Every visitor is an anonymous guest, created locally with no network call.
 * App.tsx already prefers anonymous sign-in, so the login screen is never
 * reached in demo mode. The credential-based methods stay present (the compat
 * surface is what LoginForm/RegistrationForm are typed against) but reject with
 * a clear message rather than pretending to succeed.
 */

const GUEST_NAMES = ['Guest', 'Visitor', 'Explorer', 'Newcomer'];

export type DemoUser = {
  uid: string;
  isAnonymous: boolean;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  providerData: unknown[];
  metadata: { creationTime: string; lastSignInTime: string };
  updateProfile(profile: { displayName?: string | null; photoURL?: string | null }): Promise<void>;
  getIdToken(): Promise<string>;
  delete(): Promise<void>;
};

function createGuest(): DemoUser {
  const now = new Date().toISOString();
  const name = GUEST_NAMES[Math.floor(Math.random() * GUEST_NAMES.length)];

  const user: DemoUser = {
    uid: `guest-${Math.random().toString(36).slice(2, 10)}`,
    isAnonymous: true,
    displayName: name,
    email: null,
    photoURL: null,
    emailVerified: false,
    providerData: [],
    metadata: { creationTime: now, lastSignInTime: now },
    async updateProfile(profile) {
      if (profile.displayName !== undefined) user.displayName = profile.displayName;
      if (profile.photoURL !== undefined) user.photoURL = profile.photoURL;
    },
    async getIdToken() {
      return 'demo-token';
    },
    async delete() {
      /* no-op in the demo */
    },
  };

  return user;
}

const demoOnly = (action: string) => () =>
  Promise.reject(
    new Error(
      `${action} is unavailable in the offline demo - you are already signed in as a guest.`
    )
  );

export class DemoAuth {
  currentUser: DemoUser | null = null;

  private listeners = new Set<(user: DemoUser | null) => void>();

  onAuthStateChanged(listener: (user: DemoUser | null) => void): () => void {
    this.listeners.add(listener);
    // Match Firebase: the current state is delivered asynchronously on subscribe.
    Promise.resolve().then(() => {
      if (this.listeners.has(listener)) listener(this.currentUser);
    });
    return () => {
      this.listeners.delete(listener);
    };
  }

  async signInAnonymously(): Promise<{ user: DemoUser }> {
    this.currentUser = createGuest();
    this.emit();
    return { user: this.currentUser };
  }

  async signOut(): Promise<void> {
    // Signing out would strand the visitor on a login screen that cannot work
    // offline, so hand back a fresh guest instead.
    this.currentUser = createGuest();
    this.emit();
  }

  useDeviceLanguage(): void {
    /* no-op */
  }

  signInWithPopup = demoOnly('Google sign-in');

  signInWithEmailAndPassword = demoOnly('Email sign-in');

  createUserWithEmailAndPassword = demoOnly('Registration');

  sendPasswordResetEmail = demoOnly('Password reset');

  private emit(): void {
    Array.from(this.listeners).forEach((listener) => listener(this.currentUser));
  }
}
