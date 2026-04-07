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
  platformSettings,
  themePresets,
  themeSettings,
  type ManagedUser,
  type ManagedUserStatus,
  type ModuleAccessRule,
  type ThemePreset,
} from '@/lib/mockSettings';
import { MEDIUM_LIST_PAGE_SIZE_OPTIONS } from '@/lib/pagination';
import { usePagination } from '@/lib/usePagination';

type SettingsTab = 'general' | 'users' | 'appearance' | 'access';

const settingsTabs: Array<{ id: SettingsTab; label: string; description: string }> = [
  { id: 'general', label: 'Detalles', description: 'Identidad y datos operacionales' },
  { id: 'users', label: 'Usuarios', description: 'Equipo, roles y estados' },
  { id: 'appearance', label: 'Colores', description: 'Apariencia y tono visual' },
  { id: 'access', label: 'Permisos', description: 'Visibilidad por rol' },
];

const managedUserStatusLabels: Record<ManagedUserStatus, string> = {
  active: 'Activo',
  invited: 'Invitado',
  paused: 'Pausado',
};

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

export function SettingsWorkspace() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [organization, setOrganization] = useState(organizationSettings);
  const [platform, setPlatform] = useState(platformSettings);
  const [users, setUsers] = useState(managedUsers);
  const [theme, setTheme] = useState(themeSettings);
  const [accessRules, setAccessRules] = useState(moduleAccessRules);

  const [isOrganizationModalOpen, setOrganizationModalOpen] = useState(false);
  const [isPlatformModalOpen, setPlatformModalOpen] = useState(false);
  const [isUserModalOpen, setUserModalOpen] = useState(false);
  const [isThemeModalOpen, setThemeModalOpen] = useState(false);
  const [isAccessModalOpen, setAccessModalOpen] = useState(false);

  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  const [organizationForm, setOrganizationForm] = useState(organizationSettings);
  const [platformForm, setPlatformForm] = useState(platformSettings);
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

  const activeUsersCount = useMemo(() => users.filter((item) => item.status === 'active').length, [users]);
  const invitedUsersCount = useMemo(() => users.filter((item) => item.status === 'invited').length, [users]);
  const usersPagination = usePagination(users, MEDIUM_LIST_PAGE_SIZE_OPTIONS[0]);
  const activeThemePreset = useMemo(() => themePresets.find((preset) => matchesTheme(theme, preset)) ?? null, [theme]);
  const lightThemePresets = useMemo(() => themePresets.filter((preset) => preset.mode === 'light'), []);
  const darkThemePresets = useMemo(() => themePresets.filter((preset) => preset.mode === 'dark'), []);

  function openOrganizationModal() {
    setOrganizationForm(organization);
    setOrganizationModalOpen(true);
  }

  function openPlatformModal() {
    setPlatformForm(platform);
    setPlatformModalOpen(true);
  }

  function openThemeModal() {
    setThemeForm(theme);
    setThemeModalOpen(true);
  }

  function applyThemePreset(preset: ThemePreset) {
    const { themeId: _themeId, name: _name, description: _description, ...nextTheme } = preset;

    setTheme(nextTheme);
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

  function handlePlatformSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPlatform({
      ...platformForm,
      userLimit: Number(platformForm.userLimit),
      caseLimit: Number(platformForm.caseLimit),
    });
    setPlatformModalOpen(false);
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
    { label: 'Fondo', value: theme.bg },
    { label: 'Tarjeta', value: theme.cardBgStrong },
    { label: 'Sidebar', value: theme.sidebarBg },
    { label: 'Acento', value: theme.accent },
    { label: 'Calido', value: theme.warm },
  ];

  return (
    <section className="page-stack">
      <PageHeader
        eyebrow="Configuracion"
        title="Centro de configuracion"
        description="Gestiona identidad institucional, usuarios internos, colores base y reglas de visibilidad sin mezclar estas tareas con la operacion diaria."
        actions={
          <div className="settings-header-actions">
            <span className="results-pill">Solo admin o superior</span>
          </div>
        }
      />

      <section className="summary-grid">
        <article className="summary-card">
          <span>Capacidad de casos</span>
          <strong>{platform.caseLimit.toLocaleString('es-PR')}</strong>
          <p>Tope operativo disponible bajo la configuracion actual.</p>
        </article>
        <article className="summary-card">
          <span>Usuarios habilitados</span>
          <strong>{activeUsersCount}</strong>
          <p>
            {invitedUsersCount} invitado(s) pendiente(s) · limite de {platform.userLimit}.
          </p>
        </article>
        <article className="summary-card">
          <span>Perfil actual</span>
          <strong>{accessLevelLabels[currentUser.accessLevel]}</strong>
          <p>{currentUser.title}</p>
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
        <section className="settings-card-grid">
          <article className="surface-card panel-card action-card-section settings-card">
            <div className="panel-card-heading">
              <div>
                <p className="section-kicker">Organizacion</p>
                <h3>Identidad institucional</h3>
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
                Editar organizacion
              </button>
            </div>
          </article>

          <article className="surface-card panel-card action-card-section settings-card">
            <div className="panel-card-heading">
              <div>
                <p className="section-kicker">Plataforma</p>
                <h3>Limites y defaults</h3>
              </div>
              <span className="results-pill">{platform.defaultLanguage}</span>
            </div>

            <div className="detail-highlight-grid">
              <article>
                <span>Idioma base</span>
                <strong>{platform.defaultLanguage}</strong>
              </article>
              <article>
                <span>Limite de usuarios</span>
                <strong>{platform.userLimit}</strong>
              </article>
              <article>
                <span>Limite de casos</span>
                <strong>{platform.caseLimit.toLocaleString('es-PR')}</strong>
              </article>
              <article>
                <span>Firma de reportes</span>
                <strong>{platform.reportSignature}</strong>
              </article>
            </div>

            <dl className="definition-grid">
              <div>
                <dt>Email de soporte</dt>
                <dd>{platform.supportEmail}</dd>
              </div>
            </dl>

            <div className="card-action-row">
              <button className="secondary-button card-action-button" onClick={openPlatformModal} type="button">
                Ajustar plataforma
              </button>
            </div>
          </article>
        </section>
      ) : null}

      {activeTab === 'users' ? (
        <section className="surface-card panel-card action-card-section settings-card">
          <div className="panel-card-heading">
            <div>
              <p className="section-kicker">Usuarios</p>
              <h3>Equipo con acceso al sistema</h3>
            </div>
            <span className="results-pill">{users.length} usuarios</span>
          </div>

          <div className="settings-user-list">
            {usersPagination.items.map((user) => (
              <article key={user.userId} className="settings-user-card">
                <div className="settings-user-top">
                  <div>
                    <strong>{user.name}</strong>
                    <p>
                      {user.title} · {user.email}
                    </p>
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

          <div className="card-action-row">
            <button className="primary-button card-action-button" onClick={openCreateUserModal} type="button">
              Invitar usuario
            </button>
          </div>
        </section>
      ) : null}

      {activeTab === 'appearance' ? (
        <section className="settings-card-grid">
          <article className="surface-card panel-card action-card-section settings-card">
            <div className="panel-card-heading">
              <div>
                <p className="section-kicker">Apariencia</p>
                <h3>Paleta activa</h3>
              </div>
              <span className="results-pill">{activeThemePreset ? activeThemePreset.name : 'Personalizado'}</span>
            </div>

            <div className="settings-palette-section">
              <div className="settings-palette-group">
                <div className="section-heading">
                  <h3>Temas claros</h3>
                  <span>3 presets listos</span>
                </div>
                <div className="settings-palette-grid">
                  {lightThemePresets.map((preset) => (
                    <article
                      key={preset.themeId}
                      className={matchesTheme(theme, preset) ? 'settings-palette-card active' : 'settings-palette-card'}
                    >
                      <div className="settings-palette-top">
                        <strong>{preset.name}</strong>
                        <span className="badge role-manager">Claro</span>
                      </div>
                      <div className="settings-palette-swatches">
                        <span style={{ backgroundColor: preset.bg }} />
                        <span style={{ backgroundColor: preset.cardBgStrong }} />
                        <span style={{ backgroundColor: preset.sidebarBg }} />
                        <span style={{ backgroundColor: preset.accent }} />
                        <span style={{ backgroundColor: preset.warm }} />
                      </div>
                      <div className="card-action-row">
                        <button className="secondary-button card-action-button" onClick={() => applyThemePreset(preset)} type="button">
                          Usar
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              <div className="settings-palette-group">
                <div className="section-heading">
                  <h3>Temas oscuros</h3>
                  <span>3 presets listos</span>
                </div>
                <div className="settings-palette-grid">
                  {darkThemePresets.map((preset) => (
                    <article
                      key={preset.themeId}
                      className={matchesTheme(theme, preset) ? 'settings-palette-card active' : 'settings-palette-card'}
                    >
                      <div className="settings-palette-top">
                        <strong>{preset.name}</strong>
                        <span className="badge role-admin">Oscuro</span>
                      </div>
                      <div className="settings-palette-swatches">
                        <span style={{ backgroundColor: preset.bg }} />
                        <span style={{ backgroundColor: preset.cardBgStrong }} />
                        <span style={{ backgroundColor: preset.sidebarBg }} />
                        <span style={{ backgroundColor: preset.accent }} />
                        <span style={{ backgroundColor: preset.warm }} />
                      </div>
                      <div className="card-action-row">
                        <button className="secondary-button card-action-button" onClick={() => applyThemePreset(preset)} type="button">
                          Usar
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>

            <div className="settings-swatch-grid">
              {themeSwatches.map((swatch) => (
                <article key={swatch.label} className="settings-swatch-card">
                  <span className="settings-swatch-preview" style={{ backgroundColor: swatch.value }} />
                  <div>
                    <strong>{swatch.label}</strong>
                    <p>{swatch.value}</p>
                  </div>
                </article>
              ))}
            </div>

            <div className="card-action-row">
              <button className="secondary-button card-action-button" onClick={openThemeModal} type="button">
                Editar colores
              </button>
            </div>
          </article>

          <article className="surface-card panel-card action-card-section settings-card">
            <div className="panel-card-heading">
              <div>
                <p className="section-kicker">Preview</p>
                <h3>Como se vera la interfaz</h3>
              </div>
            </div>

            <div className="theme-preview-card">
              <div className="theme-preview-sidebar" style={{ backgroundColor: theme.sidebarBg }}>
                <span style={{ backgroundColor: withAlpha(theme.accent, 0.15), color: getContrastColor(theme.accent) }}>Menu</span>
                <strong style={{ color: getContrastColor(theme.sidebarBg) }}>SFM</strong>
              </div>
              <div className="theme-preview-main" style={{ backgroundColor: theme.cardBgStrong, color: theme.ink }}>
                <span className="theme-preview-tag" style={{ backgroundColor: withAlpha(theme.accent, 0.12), color: darkenHex(theme.accent, 18) }}>
                  Acento
                </span>
                <h4>Tarjeta de ejemplo</h4>
                <p>
                  {activeThemePreset
                    ? `${activeThemePreset.name} esta aplicada ahora mismo.`
                    : 'Los cambios guardados aqui actualizan los colores base del entorno actual.'}
                </p>
                <button
                  className="theme-preview-button"
                  style={{ backgroundColor: theme.warm, color: getContrastColor(theme.warm) }}
                  type="button"
                >
                  Boton principal
                </button>
              </div>
            </div>

            <div className="card-action-row">
              <button className="secondary-button card-action-button" onClick={openThemeModal} type="button">
                Ajustar preview
              </button>
            </div>
          </article>
        </section>
      ) : null}

      {activeTab === 'access' ? (
        <section className="settings-card-grid">
          <article className="surface-card panel-card action-card-section settings-card">
            <div className="panel-card-heading">
              <div>
                <p className="section-kicker">Roles</p>
                <h3>Visibilidad de modulos</h3>
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
                Editar reglas
              </button>
            </div>
          </article>

          <article className="surface-card panel-card action-card-section settings-card">
            <div className="panel-card-heading">
              <div>
                <p className="section-kicker">Gobernanza</p>
                <h3>Acceso a configuracion</h3>
              </div>
              <span className={`badge ${getRoleBadgeClass(currentUser.accessLevel)}`}>{accessLevelLabels[currentUser.accessLevel]}</span>
            </div>

            <p className="detail-summary settings-card-copy">
              La pagina de configuracion solo debe mostrarse a perfiles con rol admin o superior. El sidebar ya aplica esa regla y esta
              vista sirve como referencia para futuras validaciones reales con autenticacion.
            </p>

            <dl className="definition-grid">
              <div>
                <dt>Usuario actual</dt>
                <dd>{currentUser.name}</dd>
              </div>
              <div>
                <dt>Rol actual</dt>
                <dd>{accessLevelLabels[currentUser.accessLevel]}</dd>
              </div>
              <div>
                <dt>Permisos destacados</dt>
                <dd>{currentUser.permissions.join(', ')}</dd>
              </div>
              <div>
                <dt>Organizacion</dt>
                <dd>{currentUser.organization}</dd>
              </div>
            </dl>
          </article>
        </section>
      ) : null}

      <AppModal
        description="Actualiza la identidad visible de la organizacion y su informacion principal."
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
              Guardar organizacion
            </button>
          </div>
        </form>
      </AppModal>

      <AppModal
        description="Ajusta limites y defaults operativos visibles para el equipo."
        onClose={() => setPlatformModalOpen(false)}
        open={isPlatformModalOpen}
        title="Ajustar plataforma"
      >
        <form className="record-form modal-form" onSubmit={handlePlatformSubmit}>
          <div className="record-form-grid">
            <label className="field">
              Idioma por defecto
              <input
                required
                type="text"
                value={platformForm.defaultLanguage}
                onChange={(event) => setPlatformForm((current) => ({ ...current, defaultLanguage: event.target.value }))}
              />
            </label>

            <label className="field">
              Email de soporte
              <input
                required
                type="email"
                value={platformForm.supportEmail}
                onChange={(event) => setPlatformForm((current) => ({ ...current, supportEmail: event.target.value }))}
              />
            </label>

            <label className="field">
              Limite de usuarios
              <input
                min={1}
                required
                type="number"
                value={platformForm.userLimit}
                onChange={(event) => setPlatformForm((current) => ({ ...current, userLimit: Number(event.target.value) }))}
              />
            </label>

            <label className="field">
              Limite de casos
              <input
                min={1}
                required
                type="number"
                value={platformForm.caseLimit}
                onChange={(event) => setPlatformForm((current) => ({ ...current, caseLimit: Number(event.target.value) }))}
              />
            </label>
          </div>

          <label className="field">
            Firma de reportes
            <input
              required
              type="text"
              value={platformForm.reportSignature}
              onChange={(event) => setPlatformForm((current) => ({ ...current, reportSignature: event.target.value }))}
            />
          </label>

          <div className="form-actions modal-actions">
            <button className="secondary-button card-action-button" onClick={() => setPlatformModalOpen(false)} type="button">
              Cancelar
            </button>
            <button className="primary-button card-action-button" type="submit">
              Guardar plataforma
            </button>
          </div>
        </form>
      </AppModal>

      <AppModal
        description="Invita usuarios nuevos o ajusta rol y estado sin saturar la pagina."
        onClose={() => setUserModalOpen(false)}
        open={isUserModalOpen}
        title={editingUserId ? 'Editar usuario' : 'Invitar usuario'}
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
              {editingUserId ? 'Guardar usuario' : 'Crear invitacion'}
            </button>
          </div>
        </form>
      </AppModal>

      <AppModal
        description="Estos colores se aplican al entorno actual para previsualizar la identidad de la organizacion."
        onClose={() => setThemeModalOpen(false)}
        open={isThemeModalOpen}
        title="Editar colores"
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
        description="Define el rol minimo necesario para que cada modulo aparezca en la interfaz."
        onClose={() => setAccessModalOpen(false)}
        open={isAccessModalOpen}
        title="Editar reglas de acceso"
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
