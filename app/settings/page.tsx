import Link from 'next/link';
import packageJson from '@/package.json';
import { PageHeader } from '@/components/PageHeader';
import { SettingsWorkspace } from '@/components/SettingsWorkspace';
import { canAccessSettings, currentUser } from '@/lib/currentUser';

export default function SettingsPage() {
  const environmentLabel =
    process.env.VERCEL_ENV === 'production'
      ? 'Produccion'
      : process.env.VERCEL_ENV === 'preview'
        ? 'Vista previa'
        : 'Desarrollo';
  const hostingLabel = process.env.VERCEL ? 'Vercel' : 'Local';

  if (!canAccessSettings(currentUser)) {
    return (
      <section className="page-stack">
        <PageHeader
          eyebrow="Configuracion"
          title="Acceso restringido"
          description="Esta seccion esta disponible solo para administradores."
          actions={
            <Link className="secondary-button" href="/">
              Volver a casos
            </Link>
          }
        />

        <section className="surface-card panel-card">
          <div className="empty-state">
            <h4>No tiene acceso a configuracion</h4>
            <p>Solicita apoyo a un administrador si necesitas cambiar datos institucionales, usuarios o apariencia.</p>
          </div>
        </section>
      </section>
    );
  }

  return (
    <SettingsWorkspace
      appVersion={`v${packageJson.version}`}
      environmentLabel={environmentLabel}
      hostingLabel={hostingLabel}
    />
  );
}
