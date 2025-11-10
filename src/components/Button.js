import React from 'react';
import './Button.css';

const Button = ({ onClick = null, children = null, className = '' }) => (
    <button onClick={onClick} className={className || 'button'}>{children}</button>
);

export default Button;
