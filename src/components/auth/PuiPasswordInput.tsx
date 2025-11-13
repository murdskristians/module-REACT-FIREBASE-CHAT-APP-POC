import { PuiIcon, PuiIconButton, PuiInputAdornment, PuiSvgIcon, PuiTextField } from 'piche.ui';
import type { ChangeEvent } from 'react';
import React, { useState } from 'react';

interface PasswordInputProps {
  size?: 'small' | 'medium';
  name: string;
  id: string;
  'aria-describedby'?: string;
  placeholder?: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  error?: boolean;
  required?: boolean;
  fullWidth?: boolean;
}

const PuiPasswordInput: React.FC<PasswordInputProps> = ({
  size = 'small',
  id,
  'aria-describedby': ariaDescribedBy,
  name = '',
  placeholder = '',
  value,
  onBlur,
  onChange,
  error = false,
  required = false,
  fullWidth = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <PuiTextField
      size={size}
      id={id}
      aria-describedby={ariaDescribedBy}
      placeholder={placeholder}
      type={showPassword ? 'text' : 'password'}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      name={name}
      required={required}
      error={error}
      InputProps={{
        endAdornment: (
          <PuiInputAdornment position='end'>
            <PuiIconButton
              aria-label='Toggle password visibility'
              onClick={handleClickShowPassword}
              edge='end'
            >
              {showPassword ? <PuiSvgIcon icon={PuiIcon.Eye} /> : <PuiSvgIcon icon={PuiIcon.EyeOff} />}
            </PuiIconButton>
          </PuiInputAdornment>
        ),
      }}
      fullWidth={fullWidth}
    />
  );
};

export { PuiPasswordInput };
