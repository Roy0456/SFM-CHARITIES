import { CaseItem, CaseStatus } from '@/lib/mockCases';

const caseStatusLabels: Record<CaseStatus, string> = {
  active: 'Activo',
  pending: 'Pendiente',
  closed: 'Cerrado',
};

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
          <p className="section-kicker">Lista principal</p>
          <h3>Expedientes</h3>
        </div>
        <span className="table-count">
          {cases.length === totalCount ? `${cases.length} expedientes` : `${cases.length} de ${totalCount} expedientes`}
        </span>
      </div>

      {cases.length === 0 ? (
        <div className="empty-state">
          <h4>No hay expedientes para esos filtros</h4>
          <p>Ajusta la busqueda o limpia los filtros para ver otros expedientes.</p>
        </div>
      ) : (
        <div className="case-list">
          {cases.map((item) => {
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
                </div>

                <div className="case-row-secondary">
                  <div className="case-row-meta">
                    <span>{item.caseManager}</span>
                    <span>
                      {item.participant.city}, {item.participant.state}
                    </span>
                    <span>{item.services.length} servicio(s)</span>
                  </div>

                  <div className="case-row-services">
                    {visibleServices.map((service) => (
                      <span key={service.caseServiceId} className="service-chip service-compact">
                        {service.serviceName}
                      </span>
                    ))}
                    {item.services.length > visibleServices.length ? (
                      <span className="service-chip service-muted">+{item.services.length - visibleServices.length} mas</span>
                    ) : null}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
