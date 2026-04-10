'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { AppModal } from '@/components/AppModal';
import { PageHeader } from '@/components/PageHeader';
import { PaginationControls } from '@/components/PaginationControls';
import { accessLevelLabels, currentUser, type UserAccessLevel } from '@/lib/currentUser';
import {
  managedUsers,
  moduleAccessRules,
  organizationSettings,
  systemSettings,
  themePresets,
  themeSettings,
  type ManagedUser,
  type ManagedUserStatus,
  type ModuleAccessRule,
  type SystemSettings,
  type ThemePreset,
} from '@/lib/mockSettings';
import { MEDIUM_LIST_PAGE_SIZE_OPTIONS } from '@/lib/pagination';
import { usePagination } from '@/lib/usePagination';

type SettingsTab = 'general' | 'users' | 'appearance' | 'access';

const settingsTabs: Array<{ id: SettingsTab; label: string; description: string }> = [
  { id: 'general', label: 'Generales', description: 'Datos institucionales' },
  { id: 'users', label: 'Usuarios', description: 'Personal y accesos' },
  { id: 'appearance', label: 'Colores', description: 'Tema de la interfaz' },
  { id: 'access', label: 'Permisos', description: 'Acceso por rol' },
];

const managedUserStatusLabels: Record<ManagedUserStatus, string> = {
  active: 'Activo',
  invited: 'Invitado',
  paused: 'Pausado',
};

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('es-PR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function hexToRgb(hex: string) {
  const sanitized = hex.replace('#', '');
  const normalized = sanitized.length === 3 ? sanitized.split('').map((value) => `${value}${value}`).join('') : sanitized;
  const parsed = Number.parseInt(normalized, 16);

  return {
    r: (parsed >> 16) & 255,
    g: (parsed >> 8) & 255,
    b: parsed & 255,
  };
}

function withAlpha(hex: string, alpha: number) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function darkenHex(hex: string, amount: number) {
  const { r, g, b } = hexToRgb(hex);
  const nextChannel = (value: number) => Math.max(0, Math.min(255, value - amount));

  return `#${[nextChannel(r), nextChannel(g), nextChannel(b)]
    .map((value) => value.toString(16).padStart(2, '0'))
    .join('')}`;
}

function getContrastColor(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  const luminance = (r * 299 + g * 587 + b * 114) / 1000;
  return luminance > 150 ? '#1f2d2d' : '#fffaf4';
}

function getStatusBadgeClass(status: ManagedUserStatus) {
  if (status === 'active') return 'user-active';
  if (status === 'invited') return 'user-invited';
  return 'user-paused';
}

function getRoleBadgeClass(role: UserAccessLevel) {
  if (role === 'owner') return 'role-owner';
  if (role === 'admin') return 'role-admin';
  if (role === 'manager') return 'role-manager';
  return 'role-staff';
}

function matchesTheme(theme: typeof themeSettings, preset: ThemePreset) {
  return (
    theme.mode === preset.mode &&
    theme.accent === preset.accent &&
    theme.warm === preset.warm &&
    theme.bg === preset.bg &&
    theme.cardBg === preset.cardBg &&
    theme.sidebarBg === preset.sidebarBg
  );
}

function isSameTheme(left: typeof themeSettings, right: typeof themeSettings) {
  return (
    left.mode === right.mode &&
    left.accent === right.accent &&
    left.warm === right.warm &&
    left.bg === right.bg &&
    left.bgSoft === right.bgSoft &&
    left.surface === right.surface &&
    left.surfaceStrong === right.surfaceStrong &&
    left.cardBg === right.cardBg &&
    left.cardBgStrong === right.cardBgStrong &&
    left.ink === right.ink &&
    left.muted === right.muted &&
    left.mutedStrong === right.mutedStrong &&
    left.line === right.line &&
    left.lineStrong === right.lineStrong &&
    left.sidebarBg === right.sidebarBg
  );
}

type SettingsWorkspaceProps = {
  appVersion: string;
  environmentLabel: string;
  hostingLabel: string;
};

export function SettingsWorkspace({
  appVersion,
  environmentLabel,
  hostingLabel,
}: SettingsWorkspaceProps) {
  const [currentManagedUserId] = useState(
    () =>
      managedUsers.find((item) => item.email === currentUser.email)?.userId ??
      managedUsers.find((item) => item.name === currentUser.name)?.userId ??
      null,
  );
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [organization, setOrganization] = useState(organizationSettings);
  const [system, setSystem] = useState(systemSettings);
  const [users, setUsers] = useState(managedUsers);
  const [theme, setTheme] = useState(themeSettings);
  const [accessRules, setAccessRules] = useState(moduleAccessRules);

  const [isOrganizationModalOpen, setOrganizationModalOpen] = useState(false);
  const [isSystemModalOpen, setSystemModalOpen] = useState(false);
  const [isUserModalOpen, setUserModalOpen] = useState(false);
  const [isThemeModalOpen, setThemeModalOpen] = useState(false);
  const [isAccessModalOpen, setAccessModalOpen] = useState(false);

  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  const [organizationForm, setOrganizationForm] = useState(organizationSettings);
  const [systemForm, setSystemForm] = useState<SystemSettings>(systemSettings);
  const [themeForm, setThemeForm] = useState(themeSettings);
  const [accessForm, setAccessForm] = useState(moduleAccessRules);
  const [userForm, setUserForm] = useState<ManagedUser>({
    userId: '',
    name: '',
    title: '',
    email: '',
    accessLevel: 'staff',
    status: 'invited',
    assignedCases: 0,
    lastAccess: new Date().toISOString(),
  });

  useEffect(() => {
    const root = document.documentElement;
    const sidebarForeground = getContrastColor(theme.sidebarBg);
    root.style.colorScheme = theme.mode;
    root.style.setProperty('--bg', theme.bg);
    root.style.setProperty('--bg-soft', theme.bgSoft);
    root.style.setProperty('--surface', theme.surface);
    root.style.setProperty('--surface-strong', theme.surfaceStrong);
    root.style.setProperty('--card-bg', theme.cardBg);
    root.style.setProperty('--card-bg-strong', theme.cardBgStrong);
    root.style.setProperty('--ink', theme.ink);
    root.style.setProperty('--muted', theme.muted);
    root.style.setProperty('--muted-strong', theme.mutedStrong);
    root.style.setProperty('--line', theme.line);
    root.style.setProperty('--line-strong', theme.lineStrong);
    root.style.setProperty('--accent', theme.accent);
    root.style.setProperty('--accent-strong', darkenHex(theme.accent, 18));
    root.style.setProperty('--accent-soft', withAlpha(theme.accent, 0.12));
    root.style.setProperty('--warm', theme.warm);
    root.style.setProperty('--warm-soft', withAlpha(theme.warm, 0.14));
    root.style.setProperty('--sidebar-bg', theme.sidebarBg);
    root.style.setProperty('--sidebar-fg', sidebarForeground);
    root.style.setProperty('--sidebar-fg-muted', withAlpha(sidebarForeground, 0.68));
    root.style.setProperty('--sidebar-fg-subtle', withAlpha(sidebarForeground, 0.56));
    root.style.setProperty('--sidebar-surface', withAlpha(sidebarForeground, 0.08));
    root.style.setProperty('--sidebar-surface-strong', withAlpha(sidebarForeground, 0.14));
    root.style.setProperty('--sidebar-border', withAlpha(sidebarForeground, 0.12));
    root.style.setProperty('--sidebar-shell-border', withAlpha(sidebarForeground, 0.18));
  }, [theme]);

  const activeManagedUser = useMemo(
    () => (currentManagedUserId ? users.find((item) => item.userId === currentManagedUserId) ?? null : null),
    [currentManagedUserId, users],
  );
  const visibleUsers = useMemo(
    () => users.filter((item) => (currentManagedUserId ? item.userId !== currentManagedUserId : true)),
    [currentManagedUserId, users],
  );
  const activeUserProfile = activeManagedUser
    ? {
        ...currentUser,
        name: activeManagedUser.name,
        title: activeManagedUser.title,
        email: activeManagedUser.email,
        accessLevel: activeManagedUser.accessLevel,
      }
    : currentUser;
  const usersPagination = usePagination(visibleUsers, MEDIUM_LIST_PAGE_SIZE_OPTIONS[0]);
  const selectedThemePreset = useMemo(() => themePresets.find((preset) => matchesTheme(themeForm, preset)) ?? null, [themeForm]);
  const lightThemePresets = useMemo(() => themePresets.filter((preset) => preset.mode === 'light'), []);
  const darkThemePresets = useMemo(() => themePresets.filter((preset) => preset.mode === 'dark'), []);

  function openOrganizationModal() {
    setOrganizationForm(organization);
    setOrganizationModalOpen(true);
  }

  function openSystemModal() {
    setSystemForm(system);
    setSystemModalOpen(true);
  }

  function openThemeModal() {
    setThemeForm(theme);
    setThemeModalOpen(true);
  }

  function applyThemePreset(preset: ThemePreset) {
    const { themeId: _themeId, name: _name, description: _description, ...nextTheme } = preset;

    setThemeForm(nextTheme);
  }

  function openAccessModal() {
    setAccessForm(accessRules.map((rule) => ({ ...rule })));
    setAccessModalOpen(true);
  }

  function openCreateUserModal() {
    setEditingUserId(null);
    setUserForm({
      userId: '',
      name: '',
      title: '',
      email: '',
      accessLevel: 'staff',
      status: 'invited',
      assignedCases: 0,
      lastAccess: new Date().toISOString(),
    });
    setUserModalOpen(true);
  }

  function openEditUserModal(user: ManagedUser) {
    setEditingUserId(user.userId);
    setUserForm(user);
    setUserModalOpen(true);
  }

  function handleOrganizationSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setOrganization(organizationForm);
    setOrganizationModalOpen(false);
  }

  function handleSystemSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSystem({
      ...systemForm,
      userLimit: Number(systemForm.userLimit),
      caseLimit: Number(systemForm.caseLimit),
    });
    setSystemModalOpen(false);
  }

  function handleThemeSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTheme(themeForm);
    setThemeModalOpen(false);
  }

  function handleAccessSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAccessRules(accessForm.map((rule) => ({ ...rule })));
    setAccessModalOpen(false);
  }

  function handleUserSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextUser: ManagedUser = {
      ...userForm,
      userId: editingUserId ?? `user-${Date.now()}`,
      assignedCases: Number(userForm.assignedCases),
      lastAccess: editingUserId ? userForm.lastAccess : new Date().toISOString(),
    };

    if (editingUserId) {
      setUsers((current) => current.map((item) => (item.userId === editingUserId ? nextUser : item)));
    } else {
      setUsers((current) => [nextUser, ...current]);
    }

    setUserModalOpen(false);
  }

  const themeSwatches = [
    { label: 'Fondo', value: themeForm.bg },
    { label: 'Tarjeta', value: themeForm.cardBgStrong },
    { label: 'Sidebar', value: themeForm.sidebarBg },
    { label: 'Acento', value: themeForm.accent },
    { label: 'Calido', value: themeForm.warm },
  ];

  return (
    <section className="page-stack">
      <PageHeader
        eyebrow="Configuracion"
        title="Administracion del sistema"
        description="Administra informacion institucional, usuarios, apariencia, permisos y datos tecnicos del sistema."
        actions={
          <div className="settings-header-actions">
            <span className="results-pill">{appVersion}</span>
            <span className="results-pill">Solo administracion</span>
          </div>
        }
      />

      <section className="summary-grid">
        <article className="summary-card">
          <span>Version actual</span>
          <strong>{appVersion}</strong>
          <p>Version visible en toda la interfaz.</p>
        </article>
        <article className="summary-card">
          <span>Zona horaria</span>
          <strong>{system.timezone}</strong>
          <p>Referencia oficial para fechas y registros.</p>
        </article>
        <article className="summary-card">
          <span>Capacidad de expedientes</span>
          <strong>{system.caseLimit.toLocaleString('es-PR')}</strong>
          <p>Tope interno configurado para la operacion.</p>
        </article>
        <article className="summary-card">
          <span>Entorno actual</span>
          <strong>{environmentLabel}</strong>
          <p>{hostingLabel} · datos simulados</p>
        </article>
      </section>

      <section className="surface-card panel-card">
        <div className="settings-tabs">
          {settingsTabs.map((tab) => (
            <button
              key={tab.id}
              className={activeTab === tab.id ? 'settings-tab-button active' : 'settings-tab-button'}
              onClick={() => setActiveTab(tab.id)}
              type="button"
            >
              <span>{tab.label}</span>
              <small>{tab.description}</small>
            </button>
          ))}
        </div>
      </section>

      {activeTab === 'general' ? (
        <section className="settings-card-grid settings-general-grid">
          <article className="surface-card panel-card action-card-section settings-card">
            <div className="panel-card-heading">
              <div>
                <p className="section-kicker">Organizacion</p>
                <h3>Datos institucionales</h3>
              </div>
              <span className="results-pill">{organization.organizationType}</span>
            </div>

            <dl className="definition-grid">
              <div>
                <dt>Nombre</dt>
                <dd>{organization.organizationName}</dd>
              </div>
              <div>
                <dt>Telefono</dt>
                <dd>{organization.organizationPhone}</dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>{organization.organizationEmail}</dd>
              </div>
              <div>
                <dt>Sitio web</dt>
                <dd>{organization.website}</dd>
              </div>
              <div>
                <dt>Contacto principal</dt>
                <dd>{organization.contactName}</dd>
              </div>
              <div>
                <dt>Fecha de formacion</dt>
                <dd>{organization.foundedOn}</dd>
              </div>
            </dl>

            <p className="detail-summary settings-card-copy">{organization.description}</p>

            <div className="card-action-row">
              <button className="secondary-button card-action-button" onClick={openOrganizationModal} type="button">
                Editar datos
              </button>
            </div>
          </article>

          <article className="surface-card panel-card action-card-section settings-card">
            <div className="panel-card-heading">
              <div>
                <p className="section-kicker">Administracion</p>
                <h3>Parametros internos</h3>
              </div>
              <span className="results-pill">{system.defaultLanguage}</span>
            </div>

            <div className="detail-highlight-grid">
              <article>
                <span>Idioma base</span>
                <strong>{system.defaultLanguage}</strong>
              </article>
              <article>
                <span>Zona horaria</span>
                <strong>{system.timezone}</strong>
              </article>
              <article>
                <span>Limite de usuarios</span>
                <strong>{system.userLimit}</strong>
              </article>
              <article>
                <span>Limite de expedientes</span>
                <strong>{system.caseLimit.toLocaleString('es-PR')}</strong>
              </article>
            </div>

            <dl className="definition-grid">
              <div>
                <dt>Correo administrativo</dt>
                <dd>{system.adminEmail}</dd>
              </div>
              <div>
                <dt>Pie de reportes</dt>
                <dd>{system.reportFooter}</dd>
              </div>
            </dl>

            <div className="card-action-row">
              <button className="secondary-button card-action-button" onClick={openSystemModal} type="button">
                Editar parametros
              </button>
            </div>
          </article>

          <article className="surface-card panel-card settings-card settings-system-card settings-tech-footer">
            <div className="panel-card-heading">
              <div>
                <p className="section-kicker">Registro tecnico</p>
                <h3>Referencia interna</h3>
              </div>
              <span className="results-pill">Solo sistema</span>
            </div>

            <div className="settings-tech-items">
              <article className="settings-tech-item">
                <span>Version</span>
                <strong>{appVersion}</strong>
              </article>
              <article className="settings-tech-item">
                <span>Entorno</span>
                <strong>{environmentLabel}</strong>
              </article>
              <article className="settings-tech-item">
                <span>Alojamiento</span>
                <strong>{hostingLabel}</strong>
              </article>
              <article className="settings-tech-item">
                <span>Datos</span>
                <strong>Simulados</strong>
              </article>
            </div>

            <p className="settings-tech-note">Uso interno. No muestra informacion de usuarios ni detalles sensibles del sistema.</p>
          </article>
        </section>
      ) : null}

      {activeTab === 'users' ? (
        <section className="surface-card panel-card action-card-section settings-card">
          <div className="panel-card-heading">
            <div>
              <p className="section-kicker">Personal</p>
              <h3>Usuarios del sistema</h3>
            </div>
            <div className="settings-panel-actions">
              <span className="results-pill">{visibleUsers.length} usuarios</span>
              <button className="primary-button card-action-button settings-top-action" onClick={openCreateUserModal} type="button">
                Agregar usuario
              </button>
            </div>
          </div>

          <article className="settings-current-user-card">
            <div className="settings-current-user-hero">
              <div className="settings-user-summary">
                <span className="settings-user-avatar-frame settings-user-avatar-frame-large">
                  <span className="settings-user-avatar">{getInitials(activeUserProfile.name)}</span>
                </span>
                <div className="settings-user-identity">
                  <p className="section-kicker">Sesion activa</p>
                  <strong>{activeUserProfile.name}</strong>
                  <p>
                    {activeUserProfile.title} · {activeUserProfile.email}
                  </p>
                </div>
              </div>
              <div className="settings-user-badges">
                <span className={`badge ${getRoleBadgeClass(activeUserProfile.accessLevel)}`}>{accessLevelLabels[activeUserProfile.accessLevel]}</span>
              </div>
            </div>

            <div className="settings-current-user-grid">
              <div>
                <span>Base operativa</span>
                <strong>{activeUserProfile.location}</strong>
              </div>
              <div>
                <span>Horario</span>
                <strong>{activeUserProfile.schedule}</strong>
              </div>
              <div>
                <span>Organizacion</span>
                <strong>{activeUserProfile.organization}</strong>
              </div>
            </div>

            <div className="settings-user-metrics">
              {activeUserProfile.metrics.map((metric) => (
                <article key={metric.label} className="settings-user-metric-card">
                  <span>{metric.label}</span>
                  <strong>{metric.value}</strong>
                </article>
              ))}
            </div>

            <p className="detail-summary settings-card-copy">{activeUserProfile.summary}</p>

            <div className="settings-user-permissions">
              {activeUserProfile.permissions.map((permission) => (
                <span key={permission} className="settings-user-permission-chip">
                  {permission}
                </span>
              ))}
            </div>

            {activeManagedUser ? (
              <div className="card-action-row">
                <button className="secondary-button card-action-button" onClick={() => openEditUserModal(activeManagedUser)} type="button">
                  Editar usuario
                </button>
              </div>
            ) : null}
          </article>

          <div className="settings-user-list">
            {usersPagination.items.map((user) => (
              <article key={user.userId} className="settings-user-card">
                <div className="settings-user-top">
                  <div className="settings-user-summary">
                    <span className="settings-user-avatar-frame">
                      <span className="settings-user-avatar">{getInitials(user.name)}</span>
                    </span>
                    <div className="settings-user-identity">
                      <strong>{user.name}</strong>
                      <p>
                        {user.title} · {user.email}
                      </p>
                    </div>
                  </div>
                  <div className="settings-user-badges">
                    <span className={`badge ${getRoleBadgeClass(user.accessLevel)}`}>{accessLevelLabels[user.accessLevel]}</span>
                    <span className={`badge ${getStatusBadgeClass(user.status)}`}>{managedUserStatusLabels[user.status]}</span>
                  </div>
                </div>

                <div className="settings-user-meta">
                  <span>{user.assignedCases} casos asignados</span>
                  <span>Ultimo acceso: {formatDateTime(user.lastAccess)}</span>
                </div>

                <div className="card-action-row">
                  <button className="secondary-button card-action-button" onClick={() => openEditUserModal(user)} type="button">
                    Editar usuario
                  </button>
                </div>
              </article>
            ))}
          </div>

          <PaginationControls
            endItem={usersPagination.endItem}
            itemLabel="usuarios"
            onPageChange={usersPagination.setPage}
            onPageSizeChange={usersPagination.setPageSize}
            page={usersPagination.page}
            pageSize={usersPagination.pageSize}
            pageSizeOptions={MEDIUM_LIST_PAGE_SIZE_OPTIONS}
            startItem={usersPagination.startItem}
            totalItems={usersPagination.totalItems}
            totalPages={usersPagination.totalPages}
          />
        </section>
      ) : null}

      {activeTab === 'appearance' ? (
        <section className="surface-card panel-card action-card-section settings-card settings-appearance-card">
          <div className="panel-card-heading">
            <div>
              <p className="section-kicker">Apariencia</p>
              <h3>Colores del sistema</h3>
            </div>
            <div className="settings-panel-actions">
              <span className="results-pill">{selectedThemePreset ? selectedThemePreset.name : 'Personalizado'}</span>
              <button className="secondary-button card-action-button settings-top-action" onClick={openThemeModal} type="button">
                Editar colores
              </button>
            </div>
          </div>

          <div className="settings-swatch-grid settings-swatch-grid-compact">
            {themeSwatches.map((swatch) => (
              <article key={swatch.label} className="settings-swatch-card settings-swatch-card-compact">
                <span className="settings-swatch-preview settings-swatch-preview-compact" style={{ backgroundColor: swatch.value }} />
                <strong>{swatch.label}</strong>
              </article>
            ))}
          </div>

          <div className="settings-palette-section">
            <div className="settings-palette-group">
              <div className="section-heading">
                <h3>Claros</h3>
              </div>
              <div className="settings-palette-grid settings-palette-grid-compact">
                {lightThemePresets.map((preset) => (
                  <button
                    key={preset.themeId}
                    className={
                      matchesTheme(themeForm, preset)
                        ? 'settings-palette-card settings-palette-card-compact settings-palette-card-selectable active'
                        : 'settings-palette-card settings-palette-card-compact settings-palette-card-selectable'
                    }
                    onClick={() => applyThemePreset(preset)}
                    type="button"
                  >
                    <div className="settings-palette-top">
                      <strong>{preset.name}</strong>
                      <span className="badge role-manager">Claro</span>
                    </div>
                    <div className="settings-palette-swatches settings-palette-swatches-animated">
                      <span style={{ backgroundColor: preset.bg }} />
                      <span style={{ backgroundColor: preset.cardBgStrong }} />
                      <span style={{ backgroundColor: preset.sidebarBg }} />
                      <span style={{ backgroundColor: preset.accent }} />
                      <span style={{ backgroundColor: preset.warm }} />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="settings-palette-group">
              <div className="section-heading">
                <h3>Oscuros</h3>
              </div>
              <div className="settings-palette-grid settings-palette-grid-compact">
                {darkThemePresets.map((preset) => (
                  <button
                    key={preset.themeId}
                    className={
                      matchesTheme(themeForm, preset)
                        ? 'settings-palette-card settings-palette-card-compact settings-palette-card-selectable active'
                        : 'settings-palette-card settings-palette-card-compact settings-palette-card-selectable'
                    }
                    onClick={() => applyThemePreset(preset)}
                    type="button"
                  >
                    <div className="settings-palette-top">
                      <strong>{preset.name}</strong>
                      <span className="badge role-admin">Oscuro</span>
                    </div>
                    <div className="settings-palette-swatches settings-palette-swatches-animated">
                      <span style={{ backgroundColor: preset.bg }} />
                      <span style={{ backgroundColor: preset.cardBgStrong }} />
                      <span style={{ backgroundColor: preset.sidebarBg }} />
                      <span style={{ backgroundColor: preset.accent }} />
                      <span style={{ backgroundColor: preset.warm }} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="card-action-row">
            <button
              className="primary-button card-action-button settings-palette-save-button"
              disabled={isSameTheme(theme, themeForm)}
              onClick={() => setTheme(themeForm)}
              type="button"
            >
              Guardar cambios
            </button>
          </div>
        </section>
      ) : null}

      {activeTab === 'access' ? (
        <section className="settings-card-grid">
          <article className="surface-card panel-card action-card-section settings-card">
            <div className="panel-card-heading">
              <div>
                <p className="section-kicker">Permisos</p>
                <h3>Acceso por modulo</h3>
              </div>
              <span className="results-pill">Reglas activas</span>
            </div>

            <div className="settings-rule-list">
              {accessRules.map((rule) => (
                <article key={rule.moduleId} className="settings-rule-card">
                  <div>
                    <strong>{rule.label}</strong>
                    <p>{rule.description}</p>
                  </div>
                  <span className={`badge ${getRoleBadgeClass(rule.minimumRole)}`}>{accessLevelLabels[rule.minimumRole]}</span>
                </article>
              ))}
            </div>

            <div className="card-action-row">
              <button className="secondary-button card-action-button" onClick={openAccessModal} type="button">
                Editar permisos
              </button>
            </div>
          </article>

          <article className="surface-card panel-card action-card-section settings-card">
            <div className="panel-card-heading">
              <div>
                <p className="section-kicker">Control</p>
                <h3>Politica de acceso</h3>
              </div>
              <span className="results-pill">Acceso restringido</span>
            </div>

            <p className="detail-summary settings-card-copy">
              La configuracion es un espacio de administracion interna. Solo debe estar disponible para perfiles con autoridad administrativa
              y esta regla ya se refleja en el menu lateral.
            </p>

            <dl className="definition-grid">
              <div>
                <dt>Rol minimo</dt>
                <dd>Admin</dd>
              </div>
              <div>
                <dt>Menu lateral</dt>
                <dd>Visible solo para administracion</dd>
              </div>
              <div>
                <dt>Acceso por ruta</dt>
                <dd>Bloqueado para perfiles sin permiso</dd>
              </div>
              <div>
                <dt>Notas sensibles</dt>
                <dd>Disponibles solo para roles autorizados</dd>
              </div>
            </dl>
          </article>
        </section>
      ) : null}

      <AppModal
        description="Actualiza los datos principales de la organizacion."
        onClose={() => setOrganizationModalOpen(false)}
        open={isOrganizationModalOpen}
        title="Editar organizacion"
      >
        <form className="record-form modal-form" onSubmit={handleOrganizationSubmit}>
          <div className="record-form-grid">
            <label className="field">
              Nombre de la organizacion
              <input
                required
                type="text"
                value={organizationForm.organizationName}
                onChange={(event) => setOrganizationForm((current) => ({ ...current, organizationName: event.target.value }))}
              />
            </label>

            <label className="field">
              Tipo de organizacion
              <input
                required
                type="text"
                value={organizationForm.organizationType}
                onChange={(event) => setOrganizationForm((current) => ({ ...current, organizationType: event.target.value }))}
              />
            </label>
          </div>

          <label className="field">
            Descripcion
            <textarea
              required
              rows={4}
              value={organizationForm.description}
              onChange={(event) => setOrganizationForm((current) => ({ ...current, description: event.target.value }))}
            />
          </label>

          <div className="record-form-grid">
            <label className="field">
              Telefono institucional
              <input
                required
                type="text"
                value={organizationForm.organizationPhone}
                onChange={(event) => setOrganizationForm((current) => ({ ...current, organizationPhone: event.target.value }))}
              />
            </label>

            <label className="field">
              Email institucional
              <input
                required
                type="email"
                value={organizationForm.organizationEmail}
                onChange={(event) => setOrganizationForm((current) => ({ ...current, organizationEmail: event.target.value }))}
              />
            </label>

            <label className="field">
              Sitio web
              <input
                required
                type="url"
                value={organizationForm.website}
                onChange={(event) => setOrganizationForm((current) => ({ ...current, website: event.target.value }))}
              />
            </label>

            <label className="field">
              Fecha de formacion
              <input
                required
                type="date"
                value={organizationForm.foundedOn}
                onChange={(event) => setOrganizationForm((current) => ({ ...current, foundedOn: event.target.value }))}
              />
            </label>
          </div>

          <div className="record-form-grid">
            <label className="field">
              Contacto principal
              <input
                required
                type="text"
                value={organizationForm.contactName}
                onChange={(event) => setOrganizationForm((current) => ({ ...current, contactName: event.target.value }))}
              />
            </label>

            <label className="field">
              Telefono del contacto
              <input
                required
                type="text"
                value={organizationForm.contactPhone}
                onChange={(event) => setOrganizationForm((current) => ({ ...current, contactPhone: event.target.value }))}
              />
            </label>

            <label className="field">
              Email del contacto
              <input
                required
                type="email"
                value={organizationForm.contactEmail}
                onChange={(event) => setOrganizationForm((current) => ({ ...current, contactEmail: event.target.value }))}
              />
            </label>

            <label className="field">
              EIN / Patrono
              <input
                required
                type="text"
                value={organizationForm.employerId}
                onChange={(event) => setOrganizationForm((current) => ({ ...current, employerId: event.target.value }))}
              />
            </label>
          </div>

          <label className="field">
            Certificado de incorporacion
            <input
              required
              type="text"
              value={organizationForm.incorporationCertificate}
              onChange={(event) => setOrganizationForm((current) => ({ ...current, incorporationCertificate: event.target.value }))}
            />
          </label>

          <div className="form-actions modal-actions">
            <button className="secondary-button card-action-button" onClick={() => setOrganizationModalOpen(false)} type="button">
              Cancelar
            </button>
            <button className="primary-button card-action-button" type="submit">
              Guardar cambios
            </button>
          </div>
        </form>
      </AppModal>

      <AppModal
        description="Ajusta los parametros internos de administracion del sistema."
        onClose={() => setSystemModalOpen(false)}
        open={isSystemModalOpen}
        title="Editar parametros internos"
      >
        <form className="record-form modal-form" onSubmit={handleSystemSubmit}>
          <div className="record-form-grid">
            <label className="field">
              Idioma por defecto
              <input
                required
                type="text"
                value={systemForm.defaultLanguage}
                onChange={(event) => setSystemForm((current) => ({ ...current, defaultLanguage: event.target.value }))}
              />
            </label>

            <label className="field">
              Zona horaria
              <input
                required
                type="text"
                value={systemForm.timezone}
                onChange={(event) => setSystemForm((current) => ({ ...current, timezone: event.target.value }))}
              />
            </label>

            <label className="field">
              Correo administrativo
              <input
                required
                type="email"
                value={systemForm.adminEmail}
                onChange={(event) => setSystemForm((current) => ({ ...current, adminEmail: event.target.value }))}
              />
            </label>

            <label className="field">
              Limite de usuarios
              <input
                min={1}
                required
                type="number"
                value={systemForm.userLimit}
                onChange={(event) => setSystemForm((current) => ({ ...current, userLimit: Number(event.target.value) }))}
              />
            </label>

            <label className="field">
              Limite de expedientes
              <input
                min={1}
                required
                type="number"
                value={systemForm.caseLimit}
                onChange={(event) => setSystemForm((current) => ({ ...current, caseLimit: Number(event.target.value) }))}
              />
            </label>
          </div>

          <label className="field">
            Pie de reportes
            <input
              required
              type="text"
              value={systemForm.reportFooter}
              onChange={(event) => setSystemForm((current) => ({ ...current, reportFooter: event.target.value }))}
            />
          </label>

          <div className="form-actions modal-actions">
            <button className="secondary-button card-action-button" onClick={() => setSystemModalOpen(false)} type="button">
              Cancelar
            </button>
            <button className="primary-button card-action-button" type="submit">
              Guardar cambios
            </button>
          </div>
        </form>
      </AppModal>

      <AppModal
        description="Invita personal nuevo o ajusta su rol y estado."
        onClose={() => setUserModalOpen(false)}
        open={isUserModalOpen}
        title={editingUserId ? 'Editar usuario' : 'Agregar usuario'}
      >
        <form className="record-form modal-form" onSubmit={handleUserSubmit}>
          <div className="record-form-grid">
            <label className="field">
              Nombre
              <input
                required
                type="text"
                value={userForm.name}
                onChange={(event) => setUserForm((current) => ({ ...current, name: event.target.value }))}
              />
            </label>

            <label className="field">
              Cargo
              <input
                required
                type="text"
                value={userForm.title}
                onChange={(event) => setUserForm((current) => ({ ...current, title: event.target.value }))}
              />
            </label>

            <label className="field">
              Email
              <input
                required
                type="email"
                value={userForm.email}
                onChange={(event) => setUserForm((current) => ({ ...current, email: event.target.value }))}
              />
            </label>

            <label className="field">
              Rol
              <select
                value={userForm.accessLevel}
                onChange={(event) => setUserForm((current) => ({ ...current, accessLevel: event.target.value as UserAccessLevel }))}
              >
                <option value="staff">Personal</option>
                <option value="manager">Gerencia</option>
                <option value="admin">Admin</option>
                <option value="owner">Super admin</option>
              </select>
            </label>

            <label className="field">
              Estado
              <select
                value={userForm.status}
                onChange={(event) => setUserForm((current) => ({ ...current, status: event.target.value as ManagedUserStatus }))}
              >
                <option value="active">Activo</option>
                <option value="invited">Invitado</option>
                <option value="paused">Pausado</option>
              </select>
            </label>

            <label className="field">
              Casos asignados
              <input
                min={0}
                required
                type="number"
                value={userForm.assignedCases}
                onChange={(event) => setUserForm((current) => ({ ...current, assignedCases: Number(event.target.value) }))}
              />
            </label>
          </div>

          <div className="form-actions modal-actions">
            <button className="secondary-button card-action-button" onClick={() => setUserModalOpen(false)} type="button">
              Cancelar
            </button>
            <button className="primary-button card-action-button" type="submit">
              {editingUserId ? 'Guardar cambios' : 'Enviar invitacion'}
            </button>
          </div>
        </form>
      </AppModal>

      <AppModal
        description="Ajusta los colores base de la interfaz."
        onClose={() => setThemeModalOpen(false)}
        open={isThemeModalOpen}
        title="Editar tema"
      >
        <form className="record-form modal-form" onSubmit={handleThemeSubmit}>
          <div className="settings-color-grid">
            <label className="field settings-color-field">
              Acento principal
              <div className="settings-color-control">
                <input
                  type="color"
                  value={themeForm.accent}
                  onChange={(event) => setThemeForm((current) => ({ ...current, accent: event.target.value }))}
                />
                <input
                  required
                  type="text"
                  value={themeForm.accent}
                  onChange={(event) => setThemeForm((current) => ({ ...current, accent: event.target.value }))}
                />
              </div>
            </label>

            <label className="field settings-color-field">
              Tono calido
              <div className="settings-color-control">
                <input
                  type="color"
                  value={themeForm.warm}
                  onChange={(event) => setThemeForm((current) => ({ ...current, warm: event.target.value }))}
                />
                <input
                  required
                  type="text"
                  value={themeForm.warm}
                  onChange={(event) => setThemeForm((current) => ({ ...current, warm: event.target.value }))}
                />
              </div>
            </label>

            <label className="field settings-color-field">
              Fondo del sidebar
              <div className="settings-color-control">
                <input
                  type="color"
                  value={themeForm.sidebarBg}
                  onChange={(event) => setThemeForm((current) => ({ ...current, sidebarBg: event.target.value }))}
                />
                <input
                  required
                  type="text"
                  value={themeForm.sidebarBg}
                  onChange={(event) => setThemeForm((current) => ({ ...current, sidebarBg: event.target.value }))}
                />
              </div>
            </label>
          </div>

          <div className="form-actions modal-actions">
            <button className="secondary-button card-action-button" onClick={() => setThemeModalOpen(false)} type="button">
              Cancelar
            </button>
            <button className="primary-button card-action-button" type="submit">
              Aplicar colores
            </button>
          </div>
        </form>
      </AppModal>

      <AppModal
        description="Define el rol minimo necesario para cada modulo."
        onClose={() => setAccessModalOpen(false)}
        open={isAccessModalOpen}
        title="Editar permisos"
      >
        <form className="record-form modal-form" onSubmit={handleAccessSubmit}>
          <div className="settings-access-form">
            {accessForm.map((rule, index) => (
              <label key={rule.moduleId} className="field">
                {rule.label}
                <select
                  value={rule.minimumRole}
                  onChange={(event) =>
                    setAccessForm((current) =>
                      current.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, minimumRole: event.target.value as UserAccessLevel } : item,
                      ),
                    )
                  }
                >
                  <option value="staff">Personal</option>
                  <option value="manager">Gerencia</option>
                  <option value="admin">Admin</option>
                  <option value="owner">Super admin</option>
                </select>
                <small>{rule.description}</small>
              </label>
            ))}
          </div>

          <div className="form-actions modal-actions">
            <button className="secondary-button card-action-button" onClick={() => setAccessModalOpen(false)} type="button">
              Cancelar
            </button>
            <button className="primary-button card-action-button" type="submit">
              Guardar reglas
            </button>
          </div>
        </form>
      </AppModal>
    </section>
  );
}
