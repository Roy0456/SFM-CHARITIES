'use client';

import { useEffect, useMemo, useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { PaginationControls } from '@/components/PaginationControls';
import { getProposalSnapshots, type ProposalCaseSummary } from '@/lib/dashboardData';
import { LARGE_LIST_PAGE_SIZE_OPTIONS, MEDIUM_LIST_PAGE_SIZE_OPTIONS } from '@/lib/pagination';
import { usePagination } from '@/lib/usePagination';

const proposalStatusLabel = {
  active: 'Activa',
  planning: 'Planificacion',
  closed: 'Cerrada',
} as const;

const caseStatusLabel = {
  active: 'Activo',
  pending: 'Pendiente',
  closed: 'Cerrado',
} as const;

const serviceStatusLabel = {
  active: 'Activa',
  pending: 'Pendiente',
  completed: 'Completada',
  cancelled: 'Cancelada',
  referred: 'Referida',
} as const;

function formatDate(value: string) {
  const parsed = new Date(`${value}T12:00:00`);
  return new Intl.DateTimeFormat('es-PR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(parsed);
}

export default function ProposalsPage() {
  const snapshots = useMemo(() => getProposalSnapshots(), []);
  const proposalsPagination = usePagination(snapshots, 10);
  const paginatedProposals = proposalsPagination.items;
  const [selectedProposalId, setSelectedProposalId] = useState<string>(paginatedProposals[0]?.proposalId ?? '');

  useEffect(() => {
    if (paginatedProposals.some((item) => item.proposalId === selectedProposalId)) {
      return;
    }

    setSelectedProposalId(paginatedProposals[0]?.proposalId ?? '');
  }, [paginatedProposals, selectedProposalId]);

  const selectedProposal = paginatedProposals.find((item) => item.proposalId === selectedProposalId) ?? paginatedProposals[0] ?? null;
  const [selectedServiceId, setSelectedServiceId] = useState<string>(selectedProposal?.services[0]?.serviceId ?? '');
  const servicesPagination = usePagination(selectedProposal?.services ?? [], 5);

  useEffect(() => {
    const visibleServices = selectedProposal?.services ?? [];

    if (visibleServices.some((item) => item.serviceId === selectedServiceId)) {
      return;
    }

    setSelectedServiceId(visibleServices[0]?.serviceId ?? '');
  }, [selectedProposal, selectedServiceId]);

  const selectedService = selectedProposal?.services.find((item) => item.serviceId === selectedServiceId) ?? selectedProposal?.services[0] ?? null;

  const selectedServiceCases = useMemo(() => {
    if (!selectedProposal || !selectedService) {
      return [] as Array<ProposalCaseSummary & { matchedService: ProposalCaseSummary['services'][number] }>;
    }

    return selectedProposal.relatedCases
      .map((item) => {
        const matchedService = item.services.find((service) => service.serviceId === selectedService.serviceId);

        if (!matchedService) {
          return null;
        }

        return {
          ...item,
          matchedService,
        };
      })
      .filter((item): item is ProposalCaseSummary & { matchedService: ProposalCaseSummary['services'][number] } => item !== null);
  }, [selectedProposal, selectedService]);

  const selectedServiceParticipantCount = useMemo(
    () => new Set(selectedServiceCases.map((item) => item.participantId)).size,
    [selectedServiceCases],
  );
  const serviceCasesPagination = usePagination(selectedServiceCases, 10);

  if (!selectedProposal) {
    return null;
  }

  return (
    <section className="page-stack">
      <PageHeader
        eyebrow="Propuestas"
        title="Propuestas y servicios"
        description="Selecciona una propuesta y luego un servicio para ver solo los casos y participantes atendidos bajo esa combinacion. Esta vista prepara mejor los reportes por fondo y servicio."
      />

      <section className="split-layout">
        <div className="panel-card surface-card">
          <div className="panel-card-heading">
            <div>
              <p className="section-kicker">Portafolio</p>
              <h3>Propuestas activas e historicas</h3>
            </div>
            <span className="results-pill">{snapshots.length} propuestas</span>
          </div>

          <div className="proposal-selector-list">
            {paginatedProposals.map((proposal) => (
              <button
                key={proposal.proposalId}
                className={proposal.proposalId === selectedProposal.proposalId ? 'proposal-selector active' : 'proposal-selector'}
                onClick={() => setSelectedProposalId(proposal.proposalId)}
                type="button"
              >
                <div>
                  <strong>
                    {proposal.proposalCode} · {proposal.proposalName}
                  </strong>
                  <p>{proposal.funder}</p>
                </div>
                <div className="proposal-selector-meta">
                  <span className={`badge proposal-${proposal.status}`}>{proposalStatusLabel[proposal.status]}</span>
                  <small>{proposal.caseCount} casos</small>
                </div>
              </button>
            ))}
          </div>

          <PaginationControls
            endItem={proposalsPagination.endItem}
            itemLabel="propuestas"
            onPageChange={proposalsPagination.setPage}
            onPageSizeChange={proposalsPagination.setPageSize}
            page={proposalsPagination.page}
            pageSize={proposalsPagination.pageSize}
            pageSizeOptions={LARGE_LIST_PAGE_SIZE_OPTIONS}
            startItem={proposalsPagination.startItem}
            totalItems={proposalsPagination.totalItems}
            totalPages={proposalsPagination.totalPages}
          />
        </div>

        <div className="detail-column">
          <section className="surface-card panel-card">
            <div className="detail-header">
              <div>
                <p className="section-kicker">Detalle de propuesta</p>
                <h2>
                  {selectedProposal.proposalCode} · {selectedProposal.proposalName}
                </h2>
                <p className="detail-subtitle">
                  {selectedProposal.funder} · {formatDate(selectedProposal.startDate)} al {formatDate(selectedProposal.endDate)}
                </p>
              </div>
              <span className={`badge proposal-${selectedProposal.status}`}>{proposalStatusLabel[selectedProposal.status]}</span>
            </div>

            <p className="detail-summary">{selectedProposal.description}</p>

            <div className="summary-grid compact">
              <article className="summary-card">
                <span>Participantes</span>
                <strong>{selectedProposal.participantCount}</strong>
                <p>Participantes unicos vinculados.</p>
              </article>
              <article className="summary-card">
                <span>Casos</span>
                <strong>{selectedProposal.caseCount}</strong>
                <p>Expedientes que tocan esta propuesta.</p>
              </article>
              <article className="summary-card">
                <span>Servicios abiertos</span>
                <strong>{selectedProposal.openAssignments}</strong>
                <p>Asignaciones activas o pendientes.</p>
              </article>
            </div>
          </section>

          <section className="surface-card panel-card">
            <div className="panel-card-heading">
              <div>
                <p className="section-kicker">Paso 2</p>
                <h3>Selecciona el servicio</h3>
              </div>
              <span className="results-pill">{selectedProposal.services.length} servicios</span>
            </div>

            <p className="section-copy">
              Todas las propuestas pueden usarse como fuente de reporte. Aqui eliges el servicio para bajar la vista a los casos que
              realmente lo recibieron bajo {selectedProposal.proposalCode}.
            </p>

            <div className="service-selector-grid">
              {servicesPagination.items.map((service) => (
                <button
                  key={service.serviceId}
                  className={service.serviceId === selectedService?.serviceId ? 'service-selector-button active' : 'service-selector-button'}
                  onClick={() => setSelectedServiceId(service.serviceId)}
                  type="button"
                >
                  <div className="service-selector-top">
                    <div>
                      <p className="service-selector-eyebrow">{service.serviceCode}</p>
                      <h4>{service.serviceName}</h4>
                    </div>
                    {service.serviceId === selectedService?.serviceId ? <span className="badge proposal-active">En foco</span> : null}
                  </div>
                  <p>{service.description}</p>
                  <div className="service-selector-stats">
                    <span>{service.assignmentCount} asignaciones</span>
                    <span>{service.openCount} abiertas</span>
                    <span>{service.completedCount} completadas</span>
                  </div>
                </button>
              ))}
            </div>

            <PaginationControls
              endItem={servicesPagination.endItem}
              itemLabel="servicios"
              onPageChange={servicesPagination.setPage}
              onPageSizeChange={servicesPagination.setPageSize}
              page={servicesPagination.page}
              pageSize={servicesPagination.pageSize}
              pageSizeOptions={MEDIUM_LIST_PAGE_SIZE_OPTIONS}
              startItem={servicesPagination.startItem}
              totalItems={servicesPagination.totalItems}
              totalPages={servicesPagination.totalPages}
            />
          </section>

          <section className="surface-card panel-card">
            <div className="panel-card-heading">
              <div>
                <p className="section-kicker">Paso 3</p>
                <h3>Casos bajo el servicio seleccionado</h3>
              </div>
              <span className="results-pill">{selectedServiceCases.length} casos</span>
            </div>

            {selectedService ? (
              <>
                <div className="service-focus-header">
                  <div>
                    <h4>
                      {selectedService.serviceName} <span>{selectedService.serviceCode}</span>
                    </h4>
                    <p>{selectedService.description}</p>
                  </div>
                  <span className="results-pill">
                    {selectedProposal.proposalCode} + {selectedService.serviceCode}
                  </span>
                </div>

                <div className="detail-highlight-grid proposal-report-grid">
                  <article>
                    <span>Participantes</span>
                    <strong>{selectedServiceParticipantCount}</strong>
                  </article>
                  <article>
                    <span>Casos</span>
                    <strong>{selectedServiceCases.length}</strong>
                  </article>
                  <article>
                    <span>Abiertas</span>
                    <strong>{selectedService.openCount}</strong>
                  </article>
                  <article>
                    <span>Completadas</span>
                    <strong>{selectedService.completedCount}</strong>
                  </article>
                </div>
              </>
            ) : null}

            {selectedServiceCases.length === 0 ? (
              <div className="empty-state">
                <h4>No hay casos bajo este cruce</h4>
                <p>Selecciona otro servicio o propuesta para revisar los expedientes atendidos.</p>
              </div>
            ) : (
              <>
                <div className="linked-case-list">
                  {serviceCasesPagination.items.map((item) => (
                    <article key={item.caseId} className="linked-case-card">
                      <div className="linked-case-top">
                        <div>
                          <strong>{item.caseNumber}</strong>
                          <p>
                            {item.participantName} · {item.city}
                          </p>
                        </div>
                        <div className="service-case-statuses">
                          <span className={`badge case-${item.caseStatus}`}>{caseStatusLabel[item.caseStatus]}</span>
                          <span className={`badge service-${item.matchedService.status}`}>
                            {serviceStatusLabel[item.matchedService.status]}
                          </span>
                        </div>
                      </div>
                      <p className="linked-case-meta">Gestor: {item.caseManager}</p>
                      <div className="case-row-services">
                        <span className={`service-chip service-${item.matchedService.status}`}>
                          {item.matchedService.serviceName} · {item.matchedService.serviceCode}
                        </span>
                      </div>
                    </article>
                  ))}
                </div>

                <PaginationControls
                  endItem={serviceCasesPagination.endItem}
                  itemLabel="casos"
                  onPageChange={serviceCasesPagination.setPage}
                  onPageSizeChange={serviceCasesPagination.setPageSize}
                  page={serviceCasesPagination.page}
                  pageSize={serviceCasesPagination.pageSize}
                  pageSizeOptions={LARGE_LIST_PAGE_SIZE_OPTIONS}
                  startItem={serviceCasesPagination.startItem}
                  totalItems={serviceCasesPagination.totalItems}
                  totalPages={serviceCasesPagination.totalPages}
                />
              </>
            )}
          </section>
        </div>
      </section>
    </section>
  );
}
