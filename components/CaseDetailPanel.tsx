import Link from 'next/link';
import { CaseItem, CaseServiceStatus, CaseStatus } from '@/lib/mockCases';

const caseStatusLabels: Record<CaseStatus, string> = {
  active: 'Activo',
  pending: 'Pendiente',
  closed: 'Cerrado',
};

const serviceStatusLabels: Record<CaseServiceStatus, string> = {
  pending: 'Pendiente',
  active: 'Activo',
  completed: 'Completado',
  cancelled: 'Cancelado',
  referred: 'Referido',
};

function formatDate(value: string) {
  const parsed = new Date(value.length > 10 ? value : `${value}T12:00:00`);
  return new Intl.DateTimeFormat('es-PR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(parsed);
}

export function CaseDetailPanel({
  caseItem,
  relatedCaseCount,
}: {
  caseItem: CaseItem | null;
  relatedCaseCount: number;
}) {
  if (!caseItem) {
    return (
      <aside className="detail-card surface-card">
        <div className="empty-state">
          <h4>Selecciona un expediente</h4>
          <p>Aqui veras el resumen del caso, los servicios y el acceso al detalle completo.</p>
        </div>
      </aside>
    );
  }

  const previewServices = caseItem.services.slice(0, 2);
  const hiddenServices = caseItem.services.length - previewServices.length;

  return (
    <aside className="detail-card surface-card">
      <div className="detail-hero">
        <div className="detail-header">
          <div>
            <p className="section-kicker">Expediente seleccionado</p>
            <h2>{caseItem.participant.fullName}</h2>
            <p className="detail-subtitle">
              {caseItem.caseNumber} · {caseItem.participant.city}, {caseItem.participant.state}
            </p>
          </div>
          <div className="detail-badges">
            <span className={`badge case-${caseItem.status}`}>{caseStatusLabels[caseItem.status]}</span>
            {caseItem.isSensitive ? <span className="badge sensitive">Manejo sensible</span> : null}
          </div>
        </div>

        <div className="detail-contact-pills">
          <span className="detail-contact-pill">{caseItem.participant.phone}</span>
          <span className="detail-contact-pill">{caseItem.participant.email}</span>
        </div>
      </div>

      <div className="detail-focus-card">
        <div>
          <span className="detail-focus-label">Proximo paso</span>
          <strong>{caseItem.nextStep}</strong>
        </div>
        <div className="detail-focus-meta">
          <span>{caseItem.notesCount} notas</span>
          <span>{caseItem.documentsCount} documentos</span>
          <span>{relatedCaseCount} expediente(s)</span>
        </div>
      </div>

      <div className="detail-highlight-grid">
        <article>
          <span>Gestor</span>
          <strong>{caseItem.caseManager}</strong>
        </article>
        <article>
          <span>Ingreso</span>
          <strong>{formatDate(caseItem.intakeDate)}</strong>
        </article>
        <article>
          <span>Servicios</span>
          <strong>{caseItem.services.length} asignaciones</strong>
        </article>
        <article>
          <span>Actividad</span>
          <strong>{caseItem.historyCount} eventos</strong>
        </article>
      </div>

      <div className="detail-columns">
        <section className="info-panel info-panel-profile">
          <div className="info-panel-header">
            <p className="info-panel-kicker">Participante</p>
            <h3>Datos del participante</h3>
          </div>
          <dl className="definition-list">
            <div>
              <dt>Edad</dt>
              <dd>{caseItem.participant.age} anos</dd>
            </div>
            <div>
              <dt>Nacimiento</dt>
              <dd>{formatDate(caseItem.participant.birthDate)}</dd>
            </div>
            <div>
              <dt>Idioma</dt>
              <dd>{caseItem.participant.preferredLanguage}</dd>
            </div>
            <div>
              <dt>Seguro</dt>
              <dd>{caseItem.participant.insuranceType}</dd>
            </div>
            <div>
              <dt>Empleo</dt>
              <dd>{caseItem.participant.employmentStatus}</dd>
            </div>
            <div>
              <dt>Ingreso</dt>
              <dd>{caseItem.participant.incomeSource}</dd>
            </div>
            <div>
              <dt>Telefono</dt>
              <dd>{caseItem.participant.phone}</dd>
            </div>
            <div>
              <dt>Vivienda</dt>
              <dd>{caseItem.participant.housingType}</dd>
            </div>
            <div>
              <dt>Expedientes</dt>
              <dd>{relatedCaseCount} relacionado(s)</dd>
            </div>
          </dl>
        </section>

        <section className="info-panel info-panel-summary">
          <div className="info-panel-header">
            <p className="info-panel-kicker">Seguimiento</p>
            <h3>Resumen del caso</h3>
          </div>
          <div className="case-summary-copy">
            <p className="detail-summary">{caseItem.summary}</p>
          </div>
          <dl className="definition-list">
            <div>
              <dt>Cierre</dt>
              <dd>{caseItem.closeDate ? formatDate(caseItem.closeDate) : 'Abierto'}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{caseItem.participant.email}</dd>
            </div>
            <div>
              <dt>Registros</dt>
              <dd>
                {caseItem.notesCount} notas · {caseItem.documentsCount} documentos
              </dd>
            </div>
          </dl>
        </section>
      </div>

      <section className="detail-section">
        <div className="section-heading">
          <h3>Servicios asignados</h3>
          <span>Vista rapida</span>
        </div>
        <div className="service-stack">
          {previewServices.map((service) => (
            <article key={service.caseServiceId} className="service-item">
              <div className="service-item-top">
                <div>
                  <h4>{service.serviceName}</h4>
                  <p>
                    {service.proposalName} · {service.proposalCode}
                  </p>
                </div>
                <div className="service-item-tags">
                  <span className={`badge service-${service.status}`}>{serviceStatusLabels[service.status]}</span>
                </div>
              </div>
              <p className="detail-summary">{service.outcome ?? 'Seguimiento en curso.'}</p>
            </article>
          ))}
        </div>
        {hiddenServices > 0 ? (
          <p className="detail-section-note">+{hiddenServices} servicio(s) adicional(es) disponible(s) en el detalle completo.</p>
        ) : null}
      </section>

      <div className="detail-actions">
        <Link className="secondary-button detail-action-button" href={`/cases/${encodeURIComponent(caseItem.caseNumber)}`}>
          Ver detalles del expediente
        </Link>
      </div>
    </aside>
  );
}
