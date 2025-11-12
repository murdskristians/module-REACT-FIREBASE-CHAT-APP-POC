import type { FC } from 'react';
import { Link } from 'react-router-dom';
import LoginForm from '../../components/auth/LoginForm';
import GoogleLoginButton from '../../components/auth/GoogleLoginButton';
import Onboarding from '../../components/auth/Onboarding';
import './auth.css';

const Login: FC = () => {
  return (
    <div className="auth-page-split">
      <div
        className="auth-left-side"
        style={{ backgroundImage: 'url(/media/backgrounds/login-background.jpg)' }}
      >
        <Onboarding />
        <div className="gradient-overlay" />
      </div>

      <div className="auth-right-side">
        <div className="auth-container">
          <div className="auth-card">
            <LoginForm />

            <div className="auth-divider">
              <span>Or login with</span>
            </div>

            <div className="social-auth-buttons">
              <GoogleLoginButton />
            </div>

            <div className="auth-footer-link">
              <span>You're new in here?</span>
              <Link to="/auth/register">Create Account</Link>
            </div>
          </div>

          <footer className="auth-footer">
            <p>© 2024-{new Date().getFullYear()} FireChat. All rights reserved.</p>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Login;
