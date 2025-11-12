import React from 'react';

import './Button.css';

type ButtonProps = {
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  children?: React.ReactNode;
  className?: string;
};

const Button: React.FC<ButtonProps> = ({
  onClick,
  children = null,
  className,
}) => (
  <button onClick={onClick} className={className ?? 'button'}>
    {children}
  </button>
);

export default Button;
