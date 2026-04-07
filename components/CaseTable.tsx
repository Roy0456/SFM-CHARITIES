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
  }).format(parsed);
}

export function CaseTable({
  cases,
  selectedCaseId,
  onSelect,
  totalCount = cases.length,
}: {
  cases: CaseItem[];
  selectedCaseId?: string;
  onSelect: (caseId: string) => void;
  totalCount?: number;
}) {
  return (
    <section className="queue-card surface-card">
      <div className="table-header">
        <div>
          <p className="section-kicker">Cola de trabajo</p>
          <h3>Casos listos para seguimiento</h3>
        </div>
        <span className="table-count">
          {cases.length === totalCount ? `${cases.length} expedientes` : `${cases.length} de ${totalCount} expedientes`}
        </span>
      </div>

      {cases.length === 0 ? (
        <div className="empty-state">
          <h4>No hay casos para esos filtros</h4>
          <p>Ajusta la busqueda o limpia los filtros para volver al portafolio completo.</p>
        </div>
      ) : (
        <div className="case-list">
          {cases.map((item) => {
            const proposalCodes = Array.from(new Set(item.services.map((service) => service.proposalCode)));
            const visibleServices = item.services.slice(0, 2);

            return (
              <button
                key={item.caseId}
                className={item.caseId === selectedCaseId ? 'case-row selected' : 'case-row'}
                onClick={() => onSelect(item.caseId)}
                type="button"
              >
                <div className="case-row-main">
                  <div className="case-row-top">
                    <span className="case-number">{item.caseNumber}</span>
                    <span className={`badge case-${item.status}`}>{caseStatusLabels[item.status]}</span>
                    {item.isSensitive ? <span className="badge sensitive">Sensible</span> : null}
                  </div>
                  <h4>{item.participant.fullName}</h4>
                  <p>{item.summary}</p>
                </div>

                <div className="case-row-services">
                  {visibleServices.map((service) => (
                    <span key={service.caseServiceId} className={`service-chip service-${service.status}`}>
                      {service.serviceName} · {serviceStatusLabels[service.status]}
                    </span>
                  ))}
                  {item.services.length > visibleServices.length ? (
                    <span className="service-chip service-muted">+{item.services.length - visibleServices.length} mas</span>
                  ) : null}
                </div>

                <div className="case-row-meta">
                  <span>{item.caseManager}</span>
                  <span>
                    {item.participant.city}, {item.participant.state}
                  </span>
                  <span>Ingreso {formatDate(item.intakeDate)}</span>
                  <span>Propuestas {proposalCodes.join(', ')}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
