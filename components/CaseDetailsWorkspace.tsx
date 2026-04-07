'use client';

import { useMemo, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { AppModal } from '@/components/AppModal';
import { CaseDetailsCollections } from '@/components/CaseDetailsCollections';
import { PageHeader } from '@/components/PageHeader';
import type { CaseDetailsRecord, CaseDocument, CaseHistoryItem, CaseNote, CaseStatus } from '@/lib/mockCases';

const caseStatusLabels: Record<CaseStatus, string> = {
  active: 'Activo',
  pending: 'Pendiente',
  closed: 'Cerrado',
};

const noteTypeOptions = ['seguimiento', 'intake', 'legal', 'salud', 'documentacion', 'psicosocial', 'general'] as const;
const documentTypeOptions = ['identificacion', 'referido', 'formulario', 'evaluacion', 'general'] as const;

function formatDate(value: string) {
  const parsed = new Date(value.length > 10 ? value : `${value}T12:00:00`);
  return new Intl.DateTimeFormat('es-PR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(parsed);
}

export function CaseDetailsWorkspace({ details }: { details: CaseDetailsRecord }) {
  const [caseItem, setCaseItem] = useState(details.caseItem);
  const [notes, setNotes] = useState(details.notes);
  const [documents, setDocuments] = useState(details.documents);
  const [history, setHistory] = useState(details.history);
  const [isCaseModalOpen, setCaseModalOpen] = useState(false);
  const [isParticipantModalOpen, setParticipantModalOpen] = useState(false);
  const [isNoteModalOpen, setNoteModalOpen] = useState(false);
  const [isDocumentModalOpen, setDocumentModalOpen] = useState(false);
  const [caseForm, setCaseForm] = useState({
    status: details.caseItem.status,
    isSensitive: details.caseItem.isSensitive,
    caseManager: details.caseItem.caseManager,
    summary: details.caseItem.summary,
    nextStep: details.caseItem.nextStep,
  });
  const [participantForm, setParticipantForm] = useState({
    phone: details.caseItem.participant.phone,
    email: details.caseItem.participant.email,
    city: details.caseItem.participant.city,
    insuranceType: details.caseItem.participant.insuranceType,
    employmentStatus: details.caseItem.participant.employmentStatus,
    housingType: details.caseItem.participant.housingType,
  });
  const [noteForm, setNoteForm] = useState({
    noteType: 'seguimiento',
    createdBy: details.caseItem.caseManager,
    content: '',
    isSensitive: false,
  });
  const [documentForm, setDocumentForm] = useState({
    documentType: 'general',
    fileName: '',
    mimeType: 'application/pdf',
    uploadedBy: details.caseItem.caseManager,
    isSensitive: false,
  });

  const metrics = useMemo(
    () => ({
      notesCount: notes.length,
      historyCount: history.length,
      documentsCount: documents.length,
    }),
    [documents.length, history.length, notes.length],
  );

  function pushHistoryEntry(entry: Omit<CaseHistoryItem, 'historyId' | 'createdAt'>) {
    const nextEntry: CaseHistoryItem = {
      historyId: `history-local-${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...entry,
    };

    setHistory((current) => [nextEntry, ...current]);
  }

  function openCaseModal() {
    setCaseForm({
      status: caseItem.status,
      isSensitive: caseItem.isSensitive,
      caseManager: caseItem.caseManager,
      summary: caseItem.summary,
      nextStep: caseItem.nextStep,
    });
    setCaseModalOpen(true);
  }

  function openParticipantModal() {
    setParticipantForm({
      phone: caseItem.participant.phone,
      email: caseItem.participant.email,
      city: caseItem.participant.city,
      insuranceType: caseItem.participant.insuranceType,
      employmentStatus: caseItem.participant.employmentStatus,
      housingType: caseItem.participant.housingType,
    });
    setParticipantModalOpen(true);
  }

  function openNoteModal() {
    setNoteForm({
      noteType: 'seguimiento',
      createdBy: caseItem.caseManager,
      content: '',
      isSensitive: false,
    });
    setNoteModalOpen(true);
  }

  function openDocumentModal() {
    setDocumentForm({
      documentType: 'general',
      fileName: '',
      mimeType: 'application/pdf',
      uploadedBy: caseItem.caseManager,
      isSensitive: false,
    });
    setDocumentModalOpen(true);
  }

  function handleCaseSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setCaseItem((current) => ({
      ...current,
      status: caseForm.status,
      isSensitive: caseForm.isSensitive,
      caseManager: caseForm.caseManager.trim(),
      summary: caseForm.summary.trim(),
      nextStep: caseForm.nextStep.trim(),
    }));
    pushHistoryEntry({
      actionType: 'case_updated',
      description: `Expediente actualizado por ${caseForm.caseManager.trim()}.`,
    });
    setCaseModalOpen(false);
  }

  function handleParticipantSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setCaseItem((current) => ({
      ...current,
      participant: {
        ...current.participant,
        phone: participantForm.phone.trim(),
        email: participantForm.email.trim(),
        city: participantForm.city.trim(),
        insuranceType: participantForm.insuranceType.trim(),
        employmentStatus: participantForm.employmentStatus.trim(),
        housingType: participantForm.housingType.trim(),
      },
    }));
    pushHistoryEntry({
      actionType: 'case_updated',
      description: `Perfil del participante actualizado para ${caseItem.participant.fullName}.`,
    });
    setParticipantModalOpen(false);
  }

  function handleNoteSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextNote: CaseNote = {
      noteId: `note-local-${Date.now()}`,
      noteType: noteForm.noteType,
      content: noteForm.content.trim(),
      isSensitive: noteForm.isSensitive,
      createdBy: noteForm.createdBy.trim(),
      createdAt: new Date().toISOString(),
    };

    setNotes((current) => [nextNote, ...current]);
    pushHistoryEntry({
      actionType: 'note_added',
      description: `Nota ${noteForm.noteType} agregada por ${noteForm.createdBy.trim()}.`,
    });
    setNoteModalOpen(false);
  }

  function handleDocumentSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextDocument: CaseDocument = {
      documentId: `doc-local-${Date.now()}`,
      documentType: documentForm.documentType,
      fileName: documentForm.fileName.trim(),
      mimeType: documentForm.mimeType.trim(),
      isSensitive: documentForm.isSensitive,
      uploadedBy: documentForm.uploadedBy.trim(),
      createdAt: new Date().toISOString(),
    };

    setDocuments((current) => [nextDocument, ...current]);
    pushHistoryEntry({
      actionType: 'document_uploaded',
      description: `Documento ${documentForm.fileName.trim()} cargado por ${documentForm.uploadedBy.trim()}.`,
    });
    setDocumentModalOpen(false);
  }

  return (
    <section className="page-stack">
      <PageHeader
        eyebrow="Expediente"
        title={`${caseItem.caseNumber} · ${caseItem.participant.fullName}`}
        description="Vista detallada del caso, siguiendo la estructura principal del sistema: caso, servicios, notas, documentos y bitacora."
        actions={
          <Link className="secondary-button" href="/">
            Volver a casos
          </Link>
        }
      />

      <section className="summary-grid">
        <article className="summary-card">
          <span>Estado del caso</span>
          <strong>{caseStatusLabels[caseItem.status]}</strong>
          <p>Gestor: {caseItem.caseManager}</p>
        </article>
        <article className="summary-card">
          <span>Notas registradas</span>
          <strong>{metrics.notesCount}</strong>
          <p>Incluye notas sensibles e internas del expediente.</p>
        </article>
        <article className="summary-card">
          <span>Documentos y eventos</span>
          <strong>{metrics.documentsCount + metrics.historyCount}</strong>
          <p>
            {metrics.documentsCount} documentos y {metrics.historyCount} eventos de bitacora.
          </p>
        </article>
      </section>

      <section className="detail-page-grid">
        <section className="surface-card detail-block action-card-section">
          <div className="section-heading">
            <h3>Datos del caso</h3>
            <div className="detail-badges">
              <span className={`badge case-${caseItem.status}`}>{caseStatusLabels[caseItem.status]}</span>
              {caseItem.isSensitive ? <span className="badge sensitive">Sensible</span> : null}
            </div>
          </div>

          <dl className="definition-grid">
            <div>
              <dt>Numero de caso</dt>
              <dd>{caseItem.caseNumber}</dd>
            </div>
            <div>
              <dt>Ingreso</dt>
              <dd>{formatDate(caseItem.intakeDate)}</dd>
            </div>
            <div>
              <dt>Cierre</dt>
              <dd>{caseItem.closeDate ? formatDate(caseItem.closeDate) : 'Abierto'}</dd>
            </div>
            <div>
              <dt>Gestor</dt>
              <dd>{caseItem.caseManager}</dd>
            </div>
          </dl>

          <p className="detail-summary">{caseItem.summary}</p>

          <div className="case-callout">
            <span>Proximo paso</span>
            <strong>{caseItem.nextStep}</strong>
          </div>

          <div className="card-action-row">
            <button className="secondary-button card-action-button" onClick={openCaseModal} type="button">
              Editar expediente
            </button>
          </div>
        </section>

        <section className="surface-card detail-block action-card-section">
          <div className="section-heading">
            <h3>Perfil del participante</h3>
          </div>

          <dl className="definition-grid">
            <div>
              <dt>Nombre</dt>
              <dd>{caseItem.participant.fullName}</dd>
            </div>
            <div>
              <dt>Edad</dt>
              <dd>{caseItem.participant.age} anos</dd>
            </div>
            <div>
              <dt>Nacimiento</dt>
              <dd>{formatDate(caseItem.participant.birthDate)}</dd>
            </div>
            <div>
              <dt>Telefono</dt>
              <dd>{caseItem.participant.phone}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{caseItem.participant.email}</dd>
            </div>
            <div>
              <dt>Ciudad</dt>
              <dd>
                {caseItem.participant.city}, {caseItem.participant.state}
              </dd>
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
              <dt>Vivienda</dt>
              <dd>{caseItem.participant.housingType}</dd>
            </div>
          </dl>

          <div className="card-action-row">
            <button className="secondary-button card-action-button" onClick={openParticipantModal} type="button">
              Editar participante
            </button>
          </div>
        </section>
      </section>

      <CaseDetailsCollections
        documents={documents}
        documentAction={
          <button className="secondary-button card-action-button" onClick={openDocumentModal} type="button">
            Registrar documento
          </button>
        }
        history={history}
        noteAction={
          <button className="secondary-button card-action-button" onClick={openNoteModal} type="button">
            Agregar nota
          </button>
        }
        notes={notes}
        services={caseItem.services}
      />

      <AppModal
        description="Ajusta estatus, sensibilidad, gestor y seguimiento sin saturar la vista principal."
        onClose={() => setCaseModalOpen(false)}
        open={isCaseModalOpen}
        title="Editar expediente"
      >
        <form className="record-form modal-form" onSubmit={handleCaseSubmit}>
          <div className="record-form-grid">
            <label className="field">
              Estado del caso
              <select
                value={caseForm.status}
                onChange={(event) => setCaseForm((current) => ({ ...current, status: event.target.value as CaseStatus }))}
              >
                <option value="active">Activo</option>
                <option value="pending">Pendiente</option>
                <option value="closed">Cerrado</option>
              </select>
            </label>

            <label className="field">
              Gestor
              <input
                required
                type="text"
                value={caseForm.caseManager}
                onChange={(event) => setCaseForm((current) => ({ ...current, caseManager: event.target.value }))}
              />
            </label>
          </div>

          <label className="field">
            Resumen del caso
            <textarea
              required
              rows={4}
              value={caseForm.summary}
              onChange={(event) => setCaseForm((current) => ({ ...current, summary: event.target.value }))}
            />
          </label>

          <label className="field">
            Proximo paso
            <textarea
              required
              rows={3}
              value={caseForm.nextStep}
              onChange={(event) => setCaseForm((current) => ({ ...current, nextStep: event.target.value }))}
            />
          </label>

          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={caseForm.isSensitive}
              onChange={(event) => setCaseForm((current) => ({ ...current, isSensitive: event.target.checked }))}
            />
            <span>Marcar expediente como sensible</span>
          </label>

          <div className="form-actions modal-actions">
            <button className="secondary-button card-action-button" onClick={() => setCaseModalOpen(false)} type="button">
              Cancelar
            </button>
            <button className="primary-button card-action-button" type="submit">
              Guardar cambios
            </button>
          </div>
        </form>
      </AppModal>

      <AppModal
        description="Actualiza contacto y contexto social del participante sin mezclarlo con la operacion diaria del caso."
        onClose={() => setParticipantModalOpen(false)}
        open={isParticipantModalOpen}
        title="Editar participante"
      >
        <form className="record-form modal-form" onSubmit={handleParticipantSubmit}>
          <div className="record-form-grid">
            <label className="field">
              Telefono
              <input
                required
                type="text"
                value={participantForm.phone}
                onChange={(event) => setParticipantForm((current) => ({ ...current, phone: event.target.value }))}
              />
            </label>

            <label className="field">
              Email
              <input
                required
                type="email"
                value={participantForm.email}
                onChange={(event) => setParticipantForm((current) => ({ ...current, email: event.target.value }))}
              />
            </label>

            <label className="field">
              Ciudad
              <input
                required
                type="text"
                value={participantForm.city}
                onChange={(event) => setParticipantForm((current) => ({ ...current, city: event.target.value }))}
              />
            </label>

            <label className="field">
              Seguro
              <input
                required
                type="text"
                value={participantForm.insuranceType}
                onChange={(event) => setParticipantForm((current) => ({ ...current, insuranceType: event.target.value }))}
              />
            </label>

            <label className="field">
              Empleo
              <input
                required
                type="text"
                value={participantForm.employmentStatus}
                onChange={(event) => setParticipantForm((current) => ({ ...current, employmentStatus: event.target.value }))}
              />
            </label>

            <label className="field">
              Vivienda
              <input
                required
                type="text"
                value={participantForm.housingType}
                onChange={(event) => setParticipantForm((current) => ({ ...current, housingType: event.target.value }))}
              />
            </label>
          </div>

          <div className="form-actions modal-actions">
            <button className="secondary-button card-action-button" onClick={() => setParticipantModalOpen(false)} type="button">
              Cancelar
            </button>
            <button className="primary-button card-action-button" type="submit">
              Guardar cambios
            </button>
          </div>
        </form>
      </AppModal>

      <AppModal
        description="Crea una nota nueva sin expandir formularios dentro del expediente."
        onClose={() => setNoteModalOpen(false)}
        open={isNoteModalOpen}
        title="Agregar nota"
      >
        <form className="record-form modal-form" onSubmit={handleNoteSubmit}>
          <div className="record-form-grid">
            <label className="field">
              Tipo de nota
              <select
                value={noteForm.noteType}
                onChange={(event) => setNoteForm((current) => ({ ...current, noteType: event.target.value }))}
              >
                {noteTypeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              Autor
              <input
                required
                type="text"
                value={noteForm.createdBy}
                onChange={(event) => setNoteForm((current) => ({ ...current, createdBy: event.target.value }))}
              />
            </label>
          </div>

          <label className="field">
            Contenido
            <textarea
              required
              rows={7}
              placeholder="Escribe seguimiento, acuerdos, hallazgos o instrucciones internas."
              value={noteForm.content}
              onChange={(event) => setNoteForm((current) => ({ ...current, content: event.target.value }))}
            />
          </label>

          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={noteForm.isSensitive}
              onChange={(event) => setNoteForm((current) => ({ ...current, isSensitive: event.target.checked }))}
            />
            <span>Nota sensible</span>
          </label>

          <div className="form-actions modal-actions">
            <button className="secondary-button card-action-button" onClick={() => setNoteModalOpen(false)} type="button">
              Cancelar
            </button>
            <button className="primary-button card-action-button" type="submit">
              Guardar nota
            </button>
          </div>
        </form>
      </AppModal>

      <AppModal
        description="Registra metadatos del documento para mantener el expediente limpio y trazable."
        onClose={() => setDocumentModalOpen(false)}
        open={isDocumentModalOpen}
        title="Registrar documento"
      >
        <form className="record-form modal-form" onSubmit={handleDocumentSubmit}>
          <div className="record-form-grid">
            <label className="field">
              Tipo de documento
              <select
                value={documentForm.documentType}
                onChange={(event) => setDocumentForm((current) => ({ ...current, documentType: event.target.value }))}
              >
                {documentTypeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              Subido por
              <input
                required
                type="text"
                value={documentForm.uploadedBy}
                onChange={(event) => setDocumentForm((current) => ({ ...current, uploadedBy: event.target.value }))}
              />
            </label>

            <label className="field">
              Nombre del archivo
              <input
                required
                type="text"
                value={documentForm.fileName}
                onChange={(event) => setDocumentForm((current) => ({ ...current, fileName: event.target.value }))}
              />
            </label>

            <label className="field">
              MIME type
              <input
                required
                type="text"
                value={documentForm.mimeType}
                onChange={(event) => setDocumentForm((current) => ({ ...current, mimeType: event.target.value }))}
              />
            </label>
          </div>

          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={documentForm.isSensitive}
              onChange={(event) => setDocumentForm((current) => ({ ...current, isSensitive: event.target.checked }))}
            />
            <span>Documento sensible</span>
          </label>

          <div className="form-actions modal-actions">
            <button className="secondary-button card-action-button" onClick={() => setDocumentModalOpen(false)} type="button">
              Cancelar
            </button>
            <button className="primary-button card-action-button" type="submit">
              Guardar documento
            </button>
          </div>
        </form>
      </AppModal>
    </section>
  );
}
