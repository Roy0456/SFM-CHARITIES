export type UserAccessLevel = 'staff' | 'manager' | 'admin' | 'owner';

export type AppUserMetric = {
  label: string;
  value: string;
};

export type AppUser = {
  userId: string;
  name: string;
  title: string;
  organization: string;
  email: string;
  location: string;
  schedule: string;
  summary: string;
  permissions: string[];
  metrics: AppUserMetric[];
  accessLevel: UserAccessLevel;
};

export const accessLevelLabels: Record<UserAccessLevel, string> = {
  staff: 'Personal',
  manager: 'Gerencia',
  admin: 'Admin',
  owner: 'Super admin',
};

const accessLevelRank: Record<UserAccessLevel, number> = {
  staff: 0,
  manager: 1,
  admin: 2,
  owner: 3,
};

export const currentUser: AppUser = {
  userId: 'user-current-001',
  name: 'Lucia Salas',
  title: 'Administradora operativa',
  organization: 'SFM Charities',
  email: 'lucia.salas@sfmcharities.org',
  location: 'San Juan, PR',
  schedule: 'Lun a Vie · 8:00 AM a 4:30 PM',
  summary: 'Supervisa expedientes sensibles, configuracion institucional y seguimiento entre propuestas y servicios.',
  permissions: ['Casos', 'Propuestas', 'Reportes', 'Configuracion', 'Notas sensibles'],
  metrics: [
    { label: 'Casos activos', value: '18' },
    { label: 'Servicios abiertos', value: '11' },
    { label: 'Reportes este mes', value: '6' },
  ],
  accessLevel: 'admin',
};

export function hasMinimumRole(role: UserAccessLevel, minimumRole: UserAccessLevel) {
  return accessLevelRank[role] >= accessLevelRank[minimumRole];
}

export function canAccessSettings(user: AppUser = currentUser) {
  return hasMinimumRole(user.accessLevel, 'admin');
}
