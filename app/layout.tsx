import './globals.css';
import type { Metadata } from 'next';
import { Sidebar } from '@/components/Sidebar';
import packageJson from '@/package.json';

export const metadata: Metadata = {
  title: 'SFM Manejo de Casos',
  description: 'Dashboard de manejo de casos, referidos y reportes',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <div className="app-shell">
          <Sidebar version={packageJson.version} />
          <main className="app-main">{children}</main>
        </div>
      </body>
    </html>
  );
}
