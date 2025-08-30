import '@/app/globals.css';
import { Space_Grotesk, Space_Mono } from 'next/font/google';
import type { Metadata } from 'next';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

const spaceMono = Space_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-space-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'NASA Space App Challenge - Asteroid Impact',
  description: '3D visualization of asteroid impacts on Earth',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${spaceGrotesk.variable} ${spaceMono.variable} font-sans min-h-screen`}>
        <div className="stars">
          {Array.from({ length: 100 }).map((_, i) => (
            <div 
              key={i}
              className="star"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 3 + 1}px`,
                height: `${Math.random() * 3 + 1}px`,
                '--opacity': Math.random() * 0.8 + 0.2,
                '--duration': `${Math.random() * 3 + 2}s`,
                '--delay': `${Math.random() * 2}s`,
              } as React.CSSProperties}
            />
          ))}
          {Array.from({ length: 5 }).map((_, i) => (
            <div 
              key={i}
              className="meteor"
              style={{
                top: `${Math.random() * 50}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 10}s`,
                animationDuration: `${Math.random() * 2 + 4}s`,
              }}
            />
          ))}
        </div>
        {children}
      </body>
    </html>
  );
}