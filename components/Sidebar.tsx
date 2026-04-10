'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AppModal } from '@/components/AppModal';
import { accessLevelLabels, canAccessSettings, currentUser } from '@/lib/currentUser';

type IconName = 'cases' | 'proposals' | 'reports' | 'settings' | 'expand' | 'collapse';

const SIDEBAR_STORAGE_KEY = 'sfm-sidebar-collapsed';

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

function SidebarIcon({ name }: { name: IconName }) {
  if (name === 'cases') {
    return (
      <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
        <path d="M4.75 8.25A2.25 2.25 0 0 1 7 6h10a2.25 2.25 0 0 1 2.25 2.25v8.5A2.25 2.25 0 0 1 17 19H7a2.25 2.25 0 0 1-2.25-2.25z" />
        <path d="M9 6V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V6" />
        <path d="M4.75 11.5h14.5" />
      </svg>
    );
  }

  if (name === 'proposals') {
    return (
      <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
        <path d="M12 4.5 19 8l-7 3.5L5 8 12 4.5Z" />
        <path d="M5 12l7 3.5 7-3.5" />
        <path d="M5 16l7 3.5 7-3.5" />
      </svg>
    );
  }

  if (name === 'reports') {
    return (
      <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
        <path d="M6 19.25V10.5" />
        <path d="M12 19.25V6.75" />
        <path d="M18 19.25v-5.5" />
        <path d="M4.75 19.25h14.5" />
      </svg>
    );
  }

  if (name === 'settings') {
    return (
      <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
        <path d="M12 8.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7Z" />
        <path d="M19 12a7 7 0 0 0-.08-1l1.54-1.2-1.5-2.6-1.87.5a7.1 7.1 0 0 0-1.72-1l-.28-1.92h-3l-.28 1.92a7.1 7.1 0 0 0-1.72 1l-1.87-.5-1.5 2.6L5.08 11A7 7 0 0 0 5 12c0 .34.03.68.08 1l-1.54 1.2 1.5 2.6 1.87-.5c.53.42 1.11.76 1.72 1l.28 1.92h3l.28-1.92c.61-.24 1.19-.58 1.72-1l1.87.5 1.5-2.6-1.54-1.2c.05-.32.08-.66.08-1Z" />
      </svg>
    );
  }

  if (name === 'expand') {
    return (
      <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
        <path d="M9 6.75 14.25 12 9 17.25" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <path d="M15 6.75 9.75 12 15 17.25" />
    </svg>
  );
}

export function Sidebar({ version }: { version: string }) {
  const pathname = usePathname();
  const [isCollapsed, setCollapsed] = useState(false);
  const [isUserModalOpen, setUserModalOpen] = useState(false);
  const navItems: Array<{
    href: string;
    label: string;
    description: string;
    icon: IconName;
  }> = [
    { href: '/', label: 'Casos', description: 'Operacion diaria', icon: 'cases' },
    { href: '/proposals', label: 'Propuestas', description: 'Fondos y servicios', icon: 'proposals' },
    { href: '/reports', label: 'Reportes', description: 'Analisis y exportacion', icon: 'reports' },
    ...(canAccessSettings(currentUser)
      ? [{ href: '/settings', label: 'Configuracion', description: 'Sistema y usuarios', icon: 'settings' as const }]
      : []),
  ];

  useEffect(() => {
    const storedValue = window.localStorage.getItem(SIDEBAR_STORAGE_KEY);
    if (storedValue === 'true') {
      setCollapsed(true);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(isCollapsed));
  }, [isCollapsed]);

  return (
    <>
      <aside className={isCollapsed ? 'sidebar collapsed' : 'sidebar'}>
        <div className="sidebar-top">
          <div className="sidebar-brand">
            <p>{isCollapsed ? 'Menu' : 'SFM Charities'}</p>
            <h2>{isCollapsed ? 'SFM' : 'Centro de gestion'}</h2>
          </div>

          <button
            aria-label={isCollapsed ? 'Expandir menu lateral' : 'Colapsar menu lateral'}
            aria-pressed={isCollapsed}
            className="sidebar-toggle"
            onClick={() => setCollapsed((current) => !current)}
            type="button"
          >
            <SidebarIcon name={isCollapsed ? 'expand' : 'collapse'} />
          </button>
        </div>

        <nav className="sidebar-menu" aria-label="Navegacion principal">
          {navItems.map((item) => {
            const isActive =
              item.href === '/'
                ? pathname === item.href || pathname.startsWith('/cases/')
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                aria-label={item.label}
                className={isActive ? 'sidebar-link active' : 'sidebar-link'}
                href={item.href}
                title={isCollapsed ? item.label : undefined}
              >
                <span className="sidebar-link-icon">
                  <SidebarIcon name={item.icon} />
                </span>
                <span className="sidebar-link-copy">
                  <span className="sidebar-link-label">{item.label}</span>
                  <small>{item.description}</small>
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-version" title={`Version actual v${version}`}>
            <span className="sidebar-version-label">Version</span>
            <strong>v{version}</strong>
          </div>

          <button
            className="sidebar-user-card"
            onClick={() => setUserModalOpen(true)}
            title={isCollapsed ? 'Ver usuario actual' : undefined}
            type="button"
          >
            <span className="sidebar-user-avatar">{getInitials(currentUser.name)}</span>
            <span className="sidebar-user-copy">
              <strong>{currentUser.name}</strong>
              <span>{currentUser.title}</span>
              <small>Ver perfil y permisos</small>
            </span>
          </button>
        </div>
      </aside>

      <AppModal
        description="Informacion del usuario y nivel de acceso en esta sesion."
        onClose={() => setUserModalOpen(false)}
        open={isUserModalOpen}
        title="Perfil del usuario"
      >
        <div className="user-modal-grid">
          <section className="user-modal-hero">
            <span className="user-modal-avatar">{getInitials(currentUser.name)}</span>
            <div className="user-modal-copy">
              <p className="section-kicker">Usuario activo</p>
              <h3>{currentUser.name}</h3>
              <p>
                {currentUser.title} · {currentUser.location}
              </p>
            </div>
            <span className={`badge ${currentUser.accessLevel === 'owner' ? 'role-owner' : 'role-admin'}`}>
              {accessLevelLabels[currentUser.accessLevel]}
            </span>
          </section>

          <section className="user-modal-stats">
            {currentUser.metrics.map((metric) => (
              <article key={metric.label}>
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
              </article>
            ))}
          </section>

          <section className="user-modal-card">
            <div className="section-heading">
              <h3>Contacto</h3>
            </div>
            <dl className="definition-grid">
              <div>
                <dt>Email</dt>
                <dd>{currentUser.email}</dd>
              </div>
              <div>
                <dt>Horario</dt>
                <dd>{currentUser.schedule}</dd>
              </div>
              <div>
                <dt>Base operativa</dt>
                <dd>{currentUser.location}</dd>
              </div>
              <div>
                <dt>Enfoque</dt>
                <dd>{currentUser.summary}</dd>
              </div>
            </dl>
          </section>

          <section className="user-modal-card">
            <div className="section-heading">
              <h3>Accesos del sistema</h3>
            </div>
            <div className="user-permission-list">
              {currentUser.permissions.map((permission) => (
                <span key={permission} className="user-permission-chip">
                  {permission}
                </span>
              ))}
            </div>
            {canAccessSettings(currentUser) ? (
              <div className="card-action-row">
                <Link className="secondary-button card-action-button" href="/settings" onClick={() => setUserModalOpen(false)}>
                  Abrir ajustes
                </Link>
              </div>
            ) : null}
          </section>
        </div>
      </AppModal>
    </>
  );
}
