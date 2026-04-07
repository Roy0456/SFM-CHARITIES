import Link from 'next/link';
import { PageHeader } from '@/components/PageHeader';
import { SettingsWorkspace } from '@/components/SettingsWorkspace';
import { canAccessSettings, currentUser } from '@/lib/currentUser';

export default function SettingsPage() {
  if (!canAccessSettings(currentUser)) {
    return (
      <section className="page-stack">
        <PageHeader
          eyebrow="Configuracion"
          title="Acceso restringido"
          description="Esta seccion solo debe estar disponible para perfiles con rol admin o superior."
          actions={
            <Link className="secondary-button" href="/">
              Volver a casos
            </Link>
          }
        />

        <section className="surface-card panel-card">
          <div className="empty-state">
            <h4>No tienes permisos suficientes</h4>
            <p>Solicita acceso a un administrador si necesitas cambiar informacion institucional, usuarios o apariencia.</p>
          </div>
        </section>
      </section>
    );
  }

  return <SettingsWorkspace />;
}
