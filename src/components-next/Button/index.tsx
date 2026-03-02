'use client';

import React from 'react';
import '../../components/Button/index.css';

interface ButtonProps {
  href?: string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: (e: React.MouseEvent) => void;
  children: React.ReactNode;
}

export default function Button({
  href = '#contact',
  className = '',
  style,
  onClick,
  children,
}: ButtonProps) {
  return (
    <a
      href={href}
      className={'button special ' + className}
      style={style}
      onClick={onClick}
    >
      {children}
    </a>
  );
}
