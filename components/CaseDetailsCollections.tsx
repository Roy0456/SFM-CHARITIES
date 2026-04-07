'use client';

import type { ReactNode } from 'react';
import { PaginationControls } from '@/components/PaginationControls';
import { MEDIUM_LIST_PAGE_SIZE_OPTIONS } from '@/lib/pagination';
import { usePagination } from '@/lib/usePagination';
import type {
  CaseDocument,
  CaseHistoryItem,
  CaseNote,
  CaseServiceAssignment,
  CaseServiceStatus,
  ServicePriority,
} from '@/lib/mockCases';

const serviceStatusLabels: Record<CaseServiceStatus, string> = {
  pending: 'Pendiente',
  active: 'Activo',
  completed: 'Completado',
  cancelled: 'Cancelado',
  referred: 'Referido',
};

const priorityLabels: Record<ServicePriority, string> = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
  urgent: 'Urgente',
};

function formatDate(value: string) {
  const parsed = new Date(value.length > 10 ? value : `${value}T12:00:00`);
  return new Intl.DateTimeFormat('es-PR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(parsed);
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('es-PR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

export function CaseDetailsCollections({
  services,
  notes,
  documents,
  history,
  noteAction,
  documentAction,
}: {
  services: CaseServiceAssignment[];
  notes: CaseNote[];
  documents: CaseDocument[];
  history: CaseHistoryItem[];
  noteAction?: ReactNode;
  documentAction?: ReactNode;
}) {
  const servicesPagination = usePagination(services, 5);
  const notesPagination = usePagination(notes, 10);
  const documentsPagination = usePagination(documents, 10);
  const historyPagination = usePagination(history, 10);

  return (
    <>
      <section className="surface-card detail-block">
        <div className="section-heading">
          <h3>Servicios del caso</h3>
          <span>{services.length} asignaciones</span>
        </div>

        {services.length === 0 ? (
          <div className="empty-state">
            <h4>Este expediente no tiene servicios</h4>
            <p>Cuando se asignen apoyos desde propuestas y servicios, apareceran aqui.</p>
          </div>
        ) : (
          <>
            <div className="service-stack">
              {servicesPagination.items.map((service) => (
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
                      <span className={`badge priority-${service.priority}`}>{priorityLabels[service.priority]}</span>
                    </div>
                  </div>

                  <dl className="service-meta">
                    <div>
                      <dt>Asignado</dt>
                      <dd>{formatDate(service.dateAssigned)}</dd>
                    </div>
                    <div>
                      <dt>Inicio</dt>
                      <dd>{service.dateStarted ? formatDate(service.dateStarted) : 'Pendiente'}</dd>
                    </div>
                    <div>
                      <dt>Completado</dt>
                      <dd>{service.dateCompleted ? formatDate(service.dateCompleted) : 'No aplica'}</dd>
                    </div>
                    <div>
                      <dt>Resultado</dt>
                      <dd>{service.outcome ?? 'Seguimiento en curso'}</dd>
                    </div>
                  </dl>
                </article>
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
          </>
        )}
      </section>

      <section className="detail-page-grid">
        <section className="surface-card detail-block action-card-section">
          <div className="section-heading">
            <h3>Notas recientes</h3>
            <span>{notes.length} registradas</span>
          </div>

          {notes.length === 0 ? (
            <div className="empty-state">
              <h4>No hay notas registradas</h4>
              <p>Las notas clinicas, sensibles o de seguimiento apareceran aqui.</p>
            </div>
          ) : (
            <>
              <div className="artifact-list">
                {notesPagination.items.map((note) => (
                  <article key={note.noteId} className="artifact-card">
                    <div className="artifact-top">
                      <div>
                        <strong>{note.noteType}</strong>
                        <p>
                          {note.createdBy} · {formatDateTime(note.createdAt)}
                        </p>
                      </div>
                      {note.isSensitive ? <span className="badge sensitive">Sensible</span> : null}
                    </div>
                    <p className="artifact-copy">{note.content}</p>
                  </article>
                ))}
              </div>

              <PaginationControls
                endItem={notesPagination.endItem}
                itemLabel="notas"
                onPageChange={notesPagination.setPage}
                onPageSizeChange={notesPagination.setPageSize}
                page={notesPagination.page}
                pageSize={notesPagination.pageSize}
                pageSizeOptions={MEDIUM_LIST_PAGE_SIZE_OPTIONS}
                startItem={notesPagination.startItem}
                totalItems={notesPagination.totalItems}
                totalPages={notesPagination.totalPages}
              />
            </>
          )}

          {noteAction ? <div className="card-action-row">{noteAction}</div> : null}
        </section>

        <section className="surface-card detail-block action-card-section">
          <div className="section-heading">
            <h3>Documentos recientes</h3>
            <span>{documents.length} cargados</span>
          </div>

          {documents.length === 0 ? (
            <div className="empty-state">
              <h4>No hay documentos cargados</h4>
              <p>Los formularios, referidos y archivos adjuntos del expediente apareceran aqui.</p>
            </div>
          ) : (
            <>
              <div className="artifact-list">
                {documentsPagination.items.map((document) => (
                  <article key={document.documentId} className="artifact-card">
                    <div className="artifact-top">
                      <div>
                        <strong>{document.fileName}</strong>
                        <p>
                          {document.documentType} · {document.mimeType}
                        </p>
                      </div>
                      {document.isSensitive ? <span className="badge sensitive">Sensible</span> : null}
                    </div>
                    <p className="artifact-copy">
                      Subido por {document.uploadedBy} · {formatDateTime(document.createdAt)}
                    </p>
                  </article>
                ))}
              </div>

              <PaginationControls
                endItem={documentsPagination.endItem}
                itemLabel="documentos"
                onPageChange={documentsPagination.setPage}
                onPageSizeChange={documentsPagination.setPageSize}
                page={documentsPagination.page}
                pageSize={documentsPagination.pageSize}
                pageSizeOptions={MEDIUM_LIST_PAGE_SIZE_OPTIONS}
                startItem={documentsPagination.startItem}
                totalItems={documentsPagination.totalItems}
                totalPages={documentsPagination.totalPages}
              />
            </>
          )}

          {documentAction ? <div className="card-action-row">{documentAction}</div> : null}
        </section>
      </section>

      <section className="surface-card detail-block">
        <div className="section-heading">
          <h3>Ultimos eventos de bitacora</h3>
          <span>{history.length} eventos</span>
        </div>

        {history.length === 0 ? (
          <div className="empty-state">
            <h4>No hay eventos en la bitacora</h4>
            <p>Los cambios importantes del expediente apareceran aqui cuando existan.</p>
          </div>
        ) : (
          <>
            <div className="history-list">
              {historyPagination.items.map((entry) => (
                <article key={entry.historyId} className="history-item">
                  <div>
                    <h4>{entry.description}</h4>
                    <p>{entry.actionType}</p>
                  </div>
                  <time>{formatDateTime(entry.createdAt)}</time>
                </article>
              ))}
            </div>

            <PaginationControls
              endItem={historyPagination.endItem}
              itemLabel="eventos"
              onPageChange={historyPagination.setPage}
              onPageSizeChange={historyPagination.setPageSize}
              page={historyPagination.page}
              pageSize={historyPagination.pageSize}
              pageSizeOptions={MEDIUM_LIST_PAGE_SIZE_OPTIONS}
              startItem={historyPagination.startItem}
              totalItems={historyPagination.totalItems}
              totalPages={historyPagination.totalPages}
            />
          </>
        )}
      </section>
    </>
  );
}
