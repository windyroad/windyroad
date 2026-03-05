import styles from './Button.module.scss';

interface ButtonProps {
  href?: string;
  variant?: 'primary' | 'outline' | 'inverted' | 'ghost';
  size?: 'default' | 'large';
  external?: boolean;
  children: React.ReactNode;
}

export default function Button({
  href = '#',
  variant = 'primary',
  size = 'default',
  external = false,
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
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {children}
    </a>
  );
}
