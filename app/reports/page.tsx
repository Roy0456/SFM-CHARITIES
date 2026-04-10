'use client';

import { useState, type FormEvent } from 'react';
import { AppModal } from '@/components/AppModal';
import { PaginationControls } from '@/components/PaginationControls';
import { PageHeader } from '@/components/PageHeader';
import { LARGE_LIST_PAGE_SIZE_OPTIONS } from '@/lib/pagination';
import { usePagination } from '@/lib/usePagination';
import { savedReports, type SavedReport } from '@/lib/mockCases';
import { getCaseMetrics } from '@/lib/dashboardData';

const metrics = getCaseMetrics();

function formatDate(value: string) {
  const parsed = new Date(value);
  return new Intl.DateTimeFormat('es-PR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(parsed);
}

export default function ReportsPage() {
  const [reportRecords, setReportRecords] = useState(savedReports);
  const [isCreateReportModalOpen, setCreateReportModalOpen] = useState(false);
  const [reportForm, setReportForm] = useState({
    reportName: '',
    reportType: 'Operacional',
    description: '',
    generatedBy: '',
  });
  const reportsPagination = usePagination(reportRecords, 10);

  function openCreateReportModal() {
    setReportForm({
      reportName: '',
      reportType: 'Operacional',
      description: '',
      generatedBy: '',
    });
    setCreateReportModalOpen(true);
  }

  function handleCreateReport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextReport: SavedReport = {
      reportId: `report-${Date.now()}`,
      reportName: reportForm.reportName.trim(),
      reportType: reportForm.reportType.trim(),
      description: reportForm.description.trim(),
      generatedBy: reportForm.generatedBy.trim(),
      generatedAt: new Date().toISOString(),
    };

    setReportRecords((current) => [nextReport, ...current]);
    setCreateReportModalOpen(false);
  }

  return (
    <section className="page-stack">
      <PageHeader
        eyebrow="Reportes"
        title="Reportes"
        description="Consulta reportes guardados y prepara nuevos resumenes del programa."
        actions={
          <button className="primary-button" onClick={openCreateReportModal} type="button">
            Crear reporte
          </button>
        }
      />

      <section className="summary-grid">
        <article className="summary-card">
          <span>Participantes atendidos</span>
          <strong>{metrics.participantCount}</strong>
          <p>Total de participantes vinculados.</p>
        </article>
        <article className="summary-card">
          <span>Expedientes sensibles</span>
          <strong>{metrics.sensitiveCases}</strong>
          <p>Expedientes que requieren manejo reforzado.</p>
        </article>
        <article className="summary-card">
          <span>Servicios cerrados</span>
          <strong>{metrics.completedAssignments}</strong>
          <p>Servicios listos para auditoria.</p>
        </article>
      </section>

      <section className="surface-card panel-card">
        <div className="panel-card-heading">
          <div>
            <p className="section-kicker">Archivo</p>
            <h3>Reportes disponibles</h3>
          </div>
          <span className="results-pill">{reportRecords.length} archivos</span>
        </div>

        <div className="report-library">
          {reportsPagination.items.map((report) => (
            <article key={report.reportId} className="report-library-card">
              <div>
                <strong>{report.reportName}</strong>
                <p>{report.description}</p>
              </div>
              <div className="report-library-meta">
                <span>{report.reportType}</span>
                <span>{formatDate(report.generatedAt)}</span>
                <span>{report.generatedBy}</span>
              </div>
            </article>
          ))}
        </div>

        <PaginationControls
          endItem={reportsPagination.endItem}
          itemLabel="reportes"
          onPageChange={reportsPagination.setPage}
          onPageSizeChange={reportsPagination.setPageSize}
          page={reportsPagination.page}
          pageSize={reportsPagination.pageSize}
          pageSizeOptions={LARGE_LIST_PAGE_SIZE_OPTIONS}
          startItem={reportsPagination.startItem}
          totalItems={reportsPagination.totalItems}
          totalPages={reportsPagination.totalPages}
        />
      </section>

      <AppModal
        description="Registra un reporte nuevo desde esta misma vista."
        onClose={() => setCreateReportModalOpen(false)}
        open={isCreateReportModalOpen}
        title="Crear reporte"
      >
        <form className="record-form modal-form" onSubmit={handleCreateReport}>
          <div className="record-form-grid">
            <label className="field">
              Nombre del reporte
              <input
                required
                type="text"
                value={reportForm.reportName}
                onChange={(event) => setReportForm((current) => ({ ...current, reportName: event.target.value }))}
              />
            </label>

            <label className="field">
              Tipo
              <input
                required
                type="text"
                value={reportForm.reportType}
                onChange={(event) => setReportForm((current) => ({ ...current, reportType: event.target.value }))}
              />
            </label>
          </div>

          <label className="field">
            Descripcion
            <textarea
              required
              rows={4}
              value={reportForm.description}
              onChange={(event) => setReportForm((current) => ({ ...current, description: event.target.value }))}
            />
          </label>

          <label className="field">
            Generado por
            <input
              required
              type="text"
              value={reportForm.generatedBy}
              onChange={(event) => setReportForm((current) => ({ ...current, generatedBy: event.target.value }))}
            />
          </label>

          <div className="form-actions modal-actions">
            <button className="secondary-button card-action-button" onClick={() => setCreateReportModalOpen(false)} type="button">
              Cancelar
            </button>
            <button className="primary-button card-action-button" type="submit">
              Guardar reporte
            </button>
          </div>
        </form>
      </AppModal>
    </section>
  );
}
