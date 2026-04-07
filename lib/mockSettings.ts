import type { UserAccessLevel } from '@/lib/currentUser';

export type OrganizationSettings = {
  organizationName: string;
  description: string;
  organizationType: string;
  organizationPhone: string;
  organizationEmail: string;
  website: string;
  foundedOn: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  employerId: string;
  incorporationCertificate: string;
};

export type PlatformSettings = {
  userLimit: number;
  caseLimit: number;
  defaultLanguage: string;
  reportSignature: string;
  supportEmail: string;
};

export type ManagedUserStatus = 'active' | 'invited' | 'paused';

export type ManagedUser = {
  userId: string;
  name: string;
  title: string;
  email: string;
  accessLevel: UserAccessLevel;
  status: ManagedUserStatus;
  assignedCases: number;
  lastAccess: string;
};

export type ThemeSettings = {
  mode: 'light' | 'dark';
  accent: string;
  warm: string;
  bg: string;
  bgSoft: string;
  surface: string;
  surfaceStrong: string;
  cardBg: string;
  cardBgStrong: string;
  sidebarBg: string;
  ink: string;
  muted: string;
  mutedStrong: string;
  line: string;
  lineStrong: string;
};

export type ThemePreset = ThemeSettings & {
  themeId: string;
  name: string;
  description: string;
  mode: 'light' | 'dark';
};

export type ModuleAccessRule = {
  moduleId: string;
  label: string;
  description: string;
  minimumRole: UserAccessLevel;
};

export const organizationSettings: OrganizationSettings = {
  organizationName: 'SFM Charities, Inc.',
  description:
    'Organizacion sin fines de lucro enfocada en acompanamiento de casos, asistencia social y coordinacion de servicios para comunidades desatendidas.',
  organizationType: 'Organizacion sin fines de lucro',
  organizationPhone: '(787) 304-2800',
  organizationEmail: 'info@sfmcharities.org',
  website: 'https://www.sfmcharities.org',
  foundedOn: '2018-06-07',
  contactName: 'Padre Samuel de Jesus Perez',
  contactPhone: '(787) 966-4677',
  contactEmail: 'sperez@sfmcharities.org',
  employerId: '660900845',
  incorporationCertificate: '410743',
};

export const platformSettings: PlatformSettings = {
  userLimit: 12,
  caseLimit: 1500,
  defaultLanguage: 'Espanol',
  reportSignature: 'SFM Charities · Centro Operacional',
  supportEmail: 'soporte@sfmcharities.org',
};

export const managedUsers: ManagedUser[] = [
  {
    userId: 'user-001',
    name: 'Lucia Salas',
    title: 'Administradora operativa',
    email: 'lucia.salas@sfmcharities.org',
    accessLevel: 'admin',
    status: 'active',
    assignedCases: 18,
    lastAccess: '2026-04-06T08:12:00-04:00',
  },
  {
    userId: 'user-002',
    name: 'Jose Rivera',
    title: 'Gestor de casos',
    email: 'jose.rivera@sfmcharities.org',
    accessLevel: 'manager',
    status: 'active',
    assignedCases: 14,
    lastAccess: '2026-04-05T16:48:00-04:00',
  },
  {
    userId: 'user-003',
    name: 'Maria Torres',
    title: 'Supervisora de reportes',
    email: 'maria.torres@sfmcharities.org',
    accessLevel: 'manager',
    status: 'active',
    assignedCases: 9,
    lastAccess: '2026-04-05T14:15:00-04:00',
  },
  {
    userId: 'user-004',
    name: 'Carlos Rivera',
    title: 'Gestor comunitario',
    email: 'carlos.rivera@sfmcharities.org',
    accessLevel: 'staff',
    status: 'active',
    assignedCases: 11,
    lastAccess: '2026-04-04T11:20:00-04:00',
  },
  {
    userId: 'user-005',
    name: 'Ana Perez',
    title: 'Oficial de documentacion',
    email: 'ana.perez@sfmcharities.org',
    accessLevel: 'staff',
    status: 'paused',
    assignedCases: 4,
    lastAccess: '2026-03-28T09:05:00-04:00',
  },
  {
    userId: 'user-006',
    name: 'Esteban Cruz',
    title: 'Analista de apoyo',
    email: 'esteban.cruz@sfmcharities.org',
    accessLevel: 'staff',
    status: 'invited',
    assignedCases: 0,
    lastAccess: '2026-04-06T00:00:00-04:00',
  },
];

export const themeSettings: ThemeSettings = {
  mode: 'light',
  accent: '#16615b',
  warm: '#c96e4b',
  bg: '#f4f0e8',
  bgSoft: '#faf7f2',
  surface: 'rgba(255, 255, 255, 0.82)',
  surfaceStrong: '#ffffff',
  cardBg: 'rgba(255, 255, 255, 0.74)',
  cardBgStrong: 'rgba(255, 255, 255, 0.92)',
  sidebarBg: '#142829',
  ink: '#1f2d2d',
  muted: '#667675',
  mutedStrong: '#445554',
  line: 'rgba(31, 45, 45, 0.1)',
  lineStrong: 'rgba(31, 45, 45, 0.16)',
};

export const themePresets: ThemePreset[] = [
  {
    themeId: 'coastal-light',
    name: 'Costa',
    description: 'Claro',
    mode: 'light',
    accent: '#1f7a73',
    warm: '#d98c5f',
    bg: '#edf3ef',
    bgSoft: '#fafcfb',
    surface: 'rgba(255, 255, 255, 0.84)',
    surfaceStrong: '#ffffff',
    cardBg: '#f7fbfa',
    cardBgStrong: '#ffffff',
    sidebarBg: '#e2eceb',
    ink: '#203030',
    muted: '#667b79',
    mutedStrong: '#465957',
    line: 'rgba(32, 48, 48, 0.1)',
    lineStrong: 'rgba(32, 48, 48, 0.16)',
  },
  {
    themeId: 'sandstone-light',
    name: 'Arena',
    description: 'Claro',
    mode: 'light',
    accent: '#8a6a2a',
    warm: '#cf7e4e',
    bg: '#f3ede2',
    bgSoft: '#fbf8f1',
    surface: 'rgba(255, 251, 245, 0.86)',
    surfaceStrong: '#fffdf8',
    cardBg: '#fbf6ee',
    cardBgStrong: '#fffdf8',
    sidebarBg: '#efe4d2',
    ink: '#2b2a26',
    muted: '#7a7265',
    mutedStrong: '#5a534a',
    line: 'rgba(43, 42, 38, 0.1)',
    lineStrong: 'rgba(43, 42, 38, 0.16)',
  },
  {
    themeId: 'civic-sky-light',
    name: 'Cielo',
    description: 'Claro',
    mode: 'light',
    accent: '#2d668c',
    warm: '#d58b62',
    bg: '#eaf0f8',
    bgSoft: '#f8fbfe',
    surface: 'rgba(255, 255, 255, 0.84)',
    surfaceStrong: '#ffffff',
    cardBg: '#f5f8fc',
    cardBgStrong: '#ffffff',
    sidebarBg: '#dee8f6',
    ink: '#1f2b35',
    muted: '#667887',
    mutedStrong: '#455867',
    line: 'rgba(31, 43, 53, 0.1)',
    lineStrong: 'rgba(31, 43, 53, 0.16)',
  },
  {
    themeId: 'atlantic-dark',
    name: 'Atlantico',
    description: 'Oscuro',
    mode: 'dark',
    accent: '#1f8a82',
    warm: '#d17a51',
    bg: '#121816',
    bgSoft: '#18211e',
    surface: 'rgba(25, 34, 31, 0.88)',
    surfaceStrong: '#202a27',
    cardBg: '#202a27',
    cardBgStrong: '#2a3632',
    sidebarBg: '#142829',
    ink: '#eef4f2',
    muted: '#b2c0bc',
    mutedStrong: '#d6dfdb',
    line: 'rgba(238, 244, 242, 0.1)',
    lineStrong: 'rgba(238, 244, 242, 0.16)',
  },
  {
    themeId: 'ember-dark',
    name: 'Brasa',
    description: 'Oscuro',
    mode: 'dark',
    accent: '#2a7368',
    warm: '#d86a3e',
    bg: '#181311',
    bgSoft: '#221917',
    surface: 'rgba(36, 28, 25, 0.88)',
    surfaceStrong: '#2b221f',
    cardBg: '#2b221f',
    cardBgStrong: '#382c28',
    sidebarBg: '#241c1a',
    ink: '#f4ede8',
    muted: '#c0b0a6',
    mutedStrong: '#e1d6cf',
    line: 'rgba(244, 237, 232, 0.1)',
    lineStrong: 'rgba(244, 237, 232, 0.16)',
  },
  {
    themeId: 'indigo-dark',
    name: 'Indigo',
    description: 'Oscuro',
    mode: 'dark',
    accent: '#4f78b7',
    warm: '#d69b46',
    bg: '#131826',
    bgSoft: '#1a2232',
    surface: 'rgba(28, 36, 53, 0.88)',
    surfaceStrong: '#222c3f',
    cardBg: '#222c3f',
    cardBgStrong: '#2c3850',
    sidebarBg: '#1c2435',
    ink: '#eef2fb',
    muted: '#b4bfd4',
    mutedStrong: '#d8dff0',
    line: 'rgba(238, 242, 251, 0.1)',
    lineStrong: 'rgba(238, 242, 251, 0.16)',
  },
];

export const moduleAccessRules: ModuleAccessRule[] = [
  {
    moduleId: 'cases',
    label: 'Casos',
    description: 'Acceso base para trabajar expedientes y seguimiento diario.',
    minimumRole: 'staff',
  },
  {
    moduleId: 'proposals',
    label: 'Propuestas',
    description: 'Visibilidad de fondos, servicios financiados y cruces para reportes.',
    minimumRole: 'manager',
  },
  {
    moduleId: 'reports',
    label: 'Reportes',
    description: 'Biblioteca de reportes guardados y exportables.',
    minimumRole: 'manager',
  },
  {
    moduleId: 'sensitive-notes',
    label: 'Notas sensibles',
    description: 'Acceso a registros marcados como confidenciales.',
    minimumRole: 'admin',
  },
  {
    moduleId: 'settings',
    label: 'Configuracion',
    description: 'Gestion de identidad institucional, usuarios y apariencia.',
    minimumRole: 'admin',
  },
];
