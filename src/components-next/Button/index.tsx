import type { MouseEventHandler, ReactNode } from 'react';
import styles from './Button.module.scss';

interface ButtonProps {
  href?: string;
  variant?: 'primary' | 'outline' | 'inverted' | 'ghost';
  size?: 'default' | 'large';
  external?: boolean;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  children: ReactNode;
}

export default function Button({
  href = '#',
  variant = 'primary',
  size = 'default',
  external = false,
  onClick,
  children,
}: ButtonProps) {
  const className = [
    styles.button,
    styles[variant],
    size === 'large' ? styles.large : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <a
      href={href}
      className={className}
      onClick={onClick}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {children}
      {external && <span className="sr-only"> (opens in new tab)</span>}
    </a>
  );
}
