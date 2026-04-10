'use client';

import { useDeferredValue, useEffect, useMemo, useState, type FormEvent } from 'react';
import { AppModal } from '@/components/AppModal';
import { PageHeader } from '@/components/PageHeader';
import { Filters, FiltersState } from '@/components/Filters';
import { CaseTable } from '@/components/CaseTable';
import { CaseDetailPanel } from '@/components/CaseDetailPanel';
import { PaginationControls } from '@/components/PaginationControls';
import { CASE_PAGE_SIZE_OPTIONS } from '@/lib/pagination';
import { usePagination } from '@/lib/usePagination';
import { cases, proposals, type CaseStatus } from '@/lib/mockCases';
import { getCaseMetrics } from '@/lib/dashboardData';

const initialFilters: FiltersState = {
  status: 'all',
  search: '',
  manager: '',
  city: '',
  proposal: '',
  service: '',
};

function uniqueOptions(values: string[]) {
  return Array.from(new Set(values))
    .sort((left, right) => left.localeCompare(right, 'es'))
    .map((value) => ({ label: value, value }));
}

function calculateAge(birthDate: string) {
  const today = new Date();
  const parsedBirthDate = new Date(`${birthDate}T12:00:00`);
  let age = today.getFullYear() - parsedBirthDate.getFullYear();
  const monthDifference = today.getMonth() - parsedBirthDate.getMonth();

  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < parsedBirthDate.getDate())) {
    age -= 1;
  }

  return Math.max(age, 0);
}

export default function HomePage() {
  const [caseRecords, setCaseRecords] = useState(cases);
  const [filters, setFilters] = useState<FiltersState>(initialFilters);
  const [selectedCaseId, setSelectedCaseId] = useState<string>(caseRecords[0]?.caseId ?? '');
  const [isCreateCaseModalOpen, setCreateCaseModalOpen] = useState(false);
  const [newCaseForm, setNewCaseForm] = useState({
    caseNumber: '',
    fullName: '',
    birthDate: '1990-01-01',
    city: 'San Juan',
    state: 'PR',
    phone: '',
    email: '',
    caseManager: '',
    status: 'active' as CaseStatus,
    summary: '',
    nextStep: 'Completar evaluacion inicial y validar documentos.',
  });
  const deferredSearch = useDeferredValue(filters.search);

  const visibleCases = useMemo(() => {
    const searchNeedle = deferredSearch.trim().toLowerCase();

    return caseRecords.filter((item) => {
      if (filters.status === 'active' && item.status !== 'active') return false;
      if (filters.status === 'pending' && item.status !== 'pending') return false;
      if (filters.status === 'closed' && item.status !== 'closed') return false;
      if (filters.status === 'sensitive' && !item.isSensitive) return false;

      if (filters.manager && item.caseManager !== filters.manager) return false;
      if (filters.city && item.participant.city !== filters.city) return false;
      if (filters.proposal && !item.services.some((service) => service.proposalId === filters.proposal)) return false;
      if (filters.service && !item.services.some((service) => service.serviceId === filters.service)) return false;

      if (!searchNeedle) return true;

      const haystack = [
        item.caseNumber,
        item.participant.fullName,
        item.caseManager,
        item.participant.city,
        item.summary,
        ...item.services.map((service) => service.serviceName),
        ...item.services.map((service) => service.proposalName),
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(searchNeedle);
    });
  }, [deferredSearch, filters.city, filters.manager, filters.proposal, filters.service, filters.status]);

  const casesPagination = usePagination(visibleCases, CASE_PAGE_SIZE_OPTIONS[0]);
  const paginatedCases = casesPagination.items;

  useEffect(() => {
    if (paginatedCases.some((item) => item.caseId === selectedCaseId)) {
      return;
    }

    setSelectedCaseId(paginatedCases[0]?.caseId ?? '');
  }, [paginatedCases, selectedCaseId]);

  const selectedCase = paginatedCases.find((item) => item.caseId === selectedCaseId) ?? paginatedCases[0] ?? null;
  const relatedCaseCount = selectedCase
    ? caseRecords.filter((item) => item.participant.participantId === selectedCase.participant.participantId).length
    : 0;

  const metrics = getCaseMetrics(visibleCases);

  const filterOptions = useMemo(
    () => ({
      managers: uniqueOptions(caseRecords.map((item) => item.caseManager)),
      cities: uniqueOptions(caseRecords.map((item) => item.participant.city)),
      proposals: proposals.map((proposal) => ({
        label: `${proposal.proposalCode} · ${proposal.proposalName}`,
        value: proposal.proposalId,
      })),
      services: proposals
        .flatMap((proposal) =>
          proposal.services.map((service) => ({
            label: `${service.serviceName} · ${proposal.proposalCode}`,
            value: service.serviceId,
          })),
        )
        .sort((left, right) => left.label.localeCompare(right.label, 'es')),
    }),
    [caseRecords],
  );

  function openCreateCaseModal() {
    setNewCaseForm({
      caseNumber: '',
      fullName: '',
      birthDate: '1990-01-01',
      city: 'San Juan',
      state: 'PR',
      phone: '',
      email: '',
      caseManager: '',
      status: 'active',
      summary: '',
      nextStep: 'Completar evaluacion inicial y validar documentos.',
    });
    setCreateCaseModalOpen(true);
  }

  function handleCreateCase(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = newCaseForm.fullName.trim();
    const [firstName = trimmedName, ...restName] = trimmedName.split(' ').filter(Boolean);
    const lastName = restName.join(' ') || firstName;
    const nextCaseId = `case-${Date.now()}`;
    const nextParticipantId = `participant-${Date.now()}`;
    const intakeDate = new Date().toISOString().slice(0, 10);

    const nextCase = {
      caseId: nextCaseId,
      caseNumber: newCaseForm.caseNumber.trim(),
      status: newCaseForm.status,
      isSensitive: false,
      intakeDate,
      summary: newCaseForm.summary.trim(),
      caseManager: newCaseForm.caseManager.trim(),
      participant: {
        participantId: nextParticipantId,
        firstName,
        lastName,
        fullName: trimmedName,
        age: calculateAge(newCaseForm.birthDate),
        birthDate: newCaseForm.birthDate,
        city: newCaseForm.city.trim(),
        state: newCaseForm.state.trim(),
        phone: newCaseForm.phone.trim(),
        email: newCaseForm.email.trim(),
        preferredLanguage: 'Espanol',
        insuranceType: 'Por definir',
        employmentStatus: 'Por definir',
        incomeSource: 'Por definir',
        housingType: 'Por definir',
      },
      services: [],
      notesCount: 0,
      documentsCount: 0,
      historyCount: 1,
      nextStep: newCaseForm.nextStep.trim(),
      recentHistory: [
        {
          historyId: `history-${Date.now()}`,
          actionType: 'case_created',
          description: `Expediente creado por ${newCaseForm.caseManager.trim()}.`,
          createdAt: new Date().toISOString(),
        },
      ],
    };

    setCaseRecords((current) => [nextCase, ...current]);
    setSelectedCaseId(nextCase.caseId);
    setCreateCaseModalOpen(false);
  }

  return (
    <section className="page-stack">
      <PageHeader
        eyebrow="Casos"
        title="Operacion diaria"
        description="Busca expedientes, revisa el resumen del caso y entra al detalle completo desde una sola vista."
        actions={
          <button className="primary-button" onClick={openCreateCaseModal} type="button">
            Nuevo caso
          </button>
        }
      />

      <section className="summary-grid">
        <article className="summary-card">
          <span>Expedientes en pantalla</span>
          <strong>{metrics.totalCases}</strong>
          <p>Expedientes dentro de la vista actual.</p>
        </article>
        <article className="summary-card">
          <span>Pendientes de gestion</span>
          <strong>{metrics.activeCases + metrics.pendingCases}</strong>
          <p>Expedientes activos o pendientes.</p>
        </article>
        <article className="summary-card">
          <span>Servicios en proceso</span>
          <strong>{metrics.openAssignments}</strong>
          <p>Asignaciones activas o pendientes.</p>
        </article>
      </section>

      <Filters
        state={filters}
        onChange={setFilters}
        onReset={() => setFilters(initialFilters)}
        resultsCount={visibleCases.length}
        managers={filterOptions.managers}
        cities={filterOptions.cities}
        proposals={filterOptions.proposals}
        services={filterOptions.services}
      />

      <section className="workspace-grid">
        <div className="workspace-main">
          <CaseTable
            cases={paginatedCases}
            selectedCaseId={selectedCase?.caseId}
            onSelect={setSelectedCaseId}
            totalCount={visibleCases.length}
          />
          <PaginationControls
            endItem={casesPagination.endItem}
            itemLabel="casos"
            onPageChange={casesPagination.setPage}
            onPageSizeChange={casesPagination.setPageSize}
            page={casesPagination.page}
            pageSize={casesPagination.pageSize}
            pageSizeOptions={CASE_PAGE_SIZE_OPTIONS}
            startItem={casesPagination.startItem}
            totalItems={casesPagination.totalItems}
            totalPages={casesPagination.totalPages}
          />
        </div>
        <CaseDetailPanel caseItem={selectedCase} relatedCaseCount={relatedCaseCount} />
      </section>

      <AppModal
        description="Registra un expediente nuevo sin salir de la operacion diaria."
        onClose={() => setCreateCaseModalOpen(false)}
        open={isCreateCaseModalOpen}
        title="Nuevo caso"
      >
        <form className="record-form modal-form" onSubmit={handleCreateCase}>
          <div className="record-form-grid">
            <label className="field">
              Numero de caso
              <input
                required
                type="text"
                value={newCaseForm.caseNumber}
                onChange={(event) => setNewCaseForm((current) => ({ ...current, caseNumber: event.target.value }))}
              />
            </label>

            <label className="field">
              Nombre completo
              <input
                required
                type="text"
                value={newCaseForm.fullName}
                onChange={(event) => setNewCaseForm((current) => ({ ...current, fullName: event.target.value }))}
              />
            </label>

            <label className="field">
              Fecha de nacimiento
              <input
                required
                type="date"
                value={newCaseForm.birthDate}
                onChange={(event) => setNewCaseForm((current) => ({ ...current, birthDate: event.target.value }))}
              />
            </label>

            <label className="field">
              Gestor
              <input
                required
                type="text"
                value={newCaseForm.caseManager}
                onChange={(event) => setNewCaseForm((current) => ({ ...current, caseManager: event.target.value }))}
              />
            </label>

            <label className="field">
              Ciudad
              <input
                required
                type="text"
                value={newCaseForm.city}
                onChange={(event) => setNewCaseForm((current) => ({ ...current, city: event.target.value }))}
              />
            </label>

            <label className="field">
              Estado
              <input
                required
                type="text"
                value={newCaseForm.state}
                onChange={(event) => setNewCaseForm((current) => ({ ...current, state: event.target.value }))}
              />
            </label>

            <label className="field">
              Telefono
              <input
                required
                type="text"
                value={newCaseForm.phone}
                onChange={(event) => setNewCaseForm((current) => ({ ...current, phone: event.target.value }))}
              />
            </label>

            <label className="field">
              Email
              <input
                required
                type="email"
                value={newCaseForm.email}
                onChange={(event) => setNewCaseForm((current) => ({ ...current, email: event.target.value }))}
              />
            </label>

            <label className="field">
              Estado del caso
              <select
                value={newCaseForm.status}
                onChange={(event) => setNewCaseForm((current) => ({ ...current, status: event.target.value as CaseStatus }))}
              >
                <option value="active">Activo</option>
                <option value="pending">Pendiente</option>
                <option value="closed">Cerrado</option>
              </select>
            </label>
          </div>

          <label className="field">
            Resumen
            <textarea
              required
              rows={4}
              value={newCaseForm.summary}
              onChange={(event) => setNewCaseForm((current) => ({ ...current, summary: event.target.value }))}
            />
          </label>

          <label className="field">
            Proximo paso
            <textarea
              required
              rows={3}
              value={newCaseForm.nextStep}
              onChange={(event) => setNewCaseForm((current) => ({ ...current, nextStep: event.target.value }))}
            />
          </label>

          <div className="form-actions modal-actions">
            <button className="secondary-button card-action-button" onClick={() => setCreateCaseModalOpen(false)} type="button">
              Cancelar
            </button>
            <button className="primary-button card-action-button" type="submit">
              Crear caso
            </button>
          </div>
        </form>
      </AppModal>
    </section>
  );
}
