import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  return (
    <header id="header">
      <h1 id="logo">
        <Link href="/">
          <Image
            src="/img/logo-white.svg"
            alt="Windy Road Logo"
            width={150}
            height={40}
            style={{
              verticalAlign: 'middle',
              position: 'relative',
              bottom: '0.2em',
            }}
          />
        </Link>
      </h1>
      <nav id="nav">
        <ul>
          <li>
            <Link href="/blog">Blog</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
