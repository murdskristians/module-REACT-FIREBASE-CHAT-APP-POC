import { useState } from 'react';
import type { FC, FormEvent } from 'react';
import {
  PuiTypography,
  PuiStack,
  PuiTextField,
  PuiLoadingButton,
  PuiFormGroup,
  PuiInputLabel,
  PuiFormHelperText,
  PuiSvgIcon,
  PuiIcon,
  PuiCheckbox,
  PuiFormControlLabel,
  PuiLink
} from 'piche.ui';
import { signInWithEmailPassword } from '../../firebase/auth';
import { PuiPasswordInput } from './PuiPasswordInput';
import { Link } from 'react-router-dom';
import './piche-ui-overrides.css';

interface LoginFormProps {
  onSuccess?: () => void;
}

const LoginForm: FC<LoginFormProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    email: '',
    password: '',
  });

  const validateForm = () => {
    const newErrors = {
      email: '',
      password: '',
    };

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email format is incorrect';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return !newErrors.email && !newErrors.password;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailPassword(email, password);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      setErrors({
        email: '',
        password: error.message || 'Invalid credentials',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PuiStack direction='column' width='100%' spacing='32px'>
        <PuiTypography
          variant='body-xl-semibold'
          component='h2'
          textAlign='center'
          sx={{ fontSize: '24px', fontWeight: 600 }}
        >
          Login to your account
        </PuiTypography>

        <PuiStack direction='column' width='100%' spacing='24px'>
          <PuiFormGroup>
            <PuiInputLabel htmlFor='email' required>
              Email address
            </PuiInputLabel>
            <PuiTextField
              size='medium'
              id='email'
              name='email'
              type='text'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder='Enter your registered email'
              error={!!errors.email}
              fullWidth
            />
            {errors.email && (
              <PuiFormHelperText error sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <PuiSvgIcon icon={PuiIcon.InfoCircle} sx={{ width: 18, height: 18 }} />
                {errors.email}
              </PuiFormHelperText>
            )}
          </PuiFormGroup>

          <PuiFormGroup>
            <PuiInputLabel htmlFor='password' required>
              Password
            </PuiInputLabel>
            <PuiPasswordInput
              size='medium'
              id='password'
              name='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder='Enter your password'
              error={!!errors.password}
              fullWidth
            />
            {errors.password && (
              <PuiFormHelperText error sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <PuiSvgIcon icon={PuiIcon.InfoCircle} sx={{ width: 18, height: 18 }} />
                {errors.password}
              </PuiFormHelperText>
            )}
          </PuiFormGroup>

          <PuiStack direction='row' justifyContent='space-between' alignItems='center'>
            <PuiFormControlLabel
              control={<PuiCheckbox />}
              label={
                <PuiTypography variant='body-m-regular'>
                  Remember Me
                </PuiTypography>
              }
            />
            <PuiLink component={Link} to='/auth/reset-password' underline='hover'>
              <PuiTypography variant='body-m-medium' color='primary'>
                Forgot Password?
              </PuiTypography>
            </PuiLink>
          </PuiStack>
        </PuiStack>

        <PuiLoadingButton
          type='submit'
          variant='contained'
          color='primary'
          size='large'
          loading={loading}
          fullWidth
        >
          Login
        </PuiLoadingButton>
      </PuiStack>
    </form>
  );
};

export default LoginForm;
