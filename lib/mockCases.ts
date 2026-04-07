export type CaseStatus = 'active' | 'pending' | 'closed';
export type CaseServiceStatus = 'pending' | 'active' | 'completed' | 'cancelled' | 'referred';
export type ServicePriority = 'low' | 'medium' | 'high' | 'urgent';
export type ProposalStatus = 'active' | 'planning' | 'closed';

export type ParticipantProfile = {
  participantId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  age: number;
  birthDate: string;
  city: string;
  state: string;
  phone: string;
  email: string;
  preferredLanguage: string;
  insuranceType: string;
  employmentStatus: string;
  incomeSource: string;
  housingType: string;
};

export type ServiceDefinition = {
  serviceId: string;
  serviceName: string;
  serviceCode: string;
  description: string;
};

export type ProposalRecord = {
  proposalId: string;
  proposalName: string;
  proposalCode: string;
  description: string;
  funder: string;
  status: ProposalStatus;
  startDate: string;
  endDate: string;
  services: ServiceDefinition[];
};

export type CaseServiceAssignment = {
  caseServiceId: string;
  serviceId: string;
  serviceName: string;
  serviceCode: string;
  proposalId: string;
  proposalName: string;
  proposalCode: string;
  status: CaseServiceStatus;
  priority: ServicePriority;
  dateAssigned: string;
  dateStarted?: string;
  dateCompleted?: string;
  outcome?: string;
};

export type CaseHistoryItem = {
  historyId: string;
  actionType: string;
  description: string;
  createdAt: string;
};

export type CaseNote = {
  noteId: string;
  noteType: string;
  content: string;
  isSensitive: boolean;
  createdBy: string;
  createdAt: string;
};

export type CaseDocument = {
  documentId: string;
  documentType: string;
  fileName: string;
  mimeType: string;
  isSensitive: boolean;
  uploadedBy: string;
  createdAt: string;
};

export type SavedReport = {
  reportId: string;
  reportName: string;
  reportType: string;
  description: string;
  generatedAt: string;
  generatedBy: string;
};

export type CaseItem = {
  caseId: string;
  caseNumber: string;
  status: CaseStatus;
  isSensitive: boolean;
  intakeDate: string;
  closeDate?: string;
  summary: string;
  caseManager: string;
  participant: ParticipantProfile;
  services: CaseServiceAssignment[];
  notesCount: number;
  documentsCount: number;
  historyCount: number;
  nextStep: string;
  recentHistory: CaseHistoryItem[];
};

export type CaseDetailsRecord = {
  caseItem: CaseItem;
  notes: CaseNote[];
  documents: CaseDocument[];
  history: CaseHistoryItem[];
};

export const proposals: ProposalRecord[] = [
  {
    proposalId: 'proposal-av26',
    proposalName: 'Acceso Vital 2026',
    proposalCode: 'AV26',
    description: 'Cubre apoyos esenciales para alimentación y vivienda inmediata.',
    funder: 'Fundacion Horizonte',
    status: 'active',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    services: [
      {
        serviceId: 'service-meals',
        serviceName: 'Apoyo nutricional',
        serviceCode: 'NUTR',
        description: 'Entrega de alimentos y seguimiento de seguridad alimentaria.',
      },
      {
        serviceId: 'service-housing',
        serviceName: 'Vivienda de emergencia',
        serviceCode: 'HOME',
        description: 'Hospedaje y apoyo de estabilizacion residencial.',
      },
    ],
  },
  {
    proposalId: 'proposal-rl26',
    proposalName: 'Ruta Legal 2026',
    proposalCode: 'RL26',
    description: 'Asistencia legal de orientacion, documentacion y referidos.',
    funder: 'Justicia Abierta',
    status: 'active',
    startDate: '2026-02-01',
    endDate: '2026-11-30',
    services: [
      {
        serviceId: 'service-legal',
        serviceName: 'Orientacion legal',
        serviceCode: 'LEGAL',
        description: 'Evaluacion inicial y orientacion sobre derechos y tramites.',
      },
      {
        serviceId: 'service-docs',
        serviceName: 'Recuperacion de documentos',
        serviceCode: 'DOCS',
        description: 'Apoyo con identificacion, actas y documentacion critica.',
      },
    ],
  },
  {
    proposalId: 'proposal-sc26',
    proposalName: 'Salud en Comunidad 2026',
    proposalCode: 'SC26',
    description: 'Coordina referidos medicos y acompanamiento psicosocial.',
    funder: 'Red Salud Solidaria',
    status: 'active',
    startDate: '2026-01-15',
    endDate: '2026-12-15',
    services: [
      {
        serviceId: 'service-medical',
        serviceName: 'Referido medico',
        serviceCode: 'MED',
        description: 'Canaliza atencion primaria, especialistas y medicamentos.',
      },
      {
        serviceId: 'service-psych',
        serviceName: 'Acompanamiento psicosocial',
        serviceCode: 'PSY',
        description: 'Seguimiento emocional y coordinacion comunitaria.',
      },
    ],
  },
  {
    proposalId: 'proposal-pu25',
    proposalName: 'Puentes de Empleo 2025',
    proposalCode: 'PE25',
    description: 'Cierre de ciclo para capacitacion y reintegracion laboral.',
    funder: 'Fondo Comunidad y Trabajo',
    status: 'closed',
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    services: [
      {
        serviceId: 'service-employment',
        serviceName: 'Ruta laboral',
        serviceCode: 'WORK',
        description: 'Capacitacion, referidos y acompanamiento de empleo.',
      },
    ],
  },
];

export const cases: CaseItem[] = [
  {
    caseId: 'case-001',
    caseNumber: 'Mar26-398023',
    status: 'active',
    isSensitive: true,
    intakeDate: '2026-03-11',
    summary: 'Adulto mayor con inseguridad alimentaria y necesidad de orientacion legal para renovacion de documentos.',
    caseManager: 'Lucia Salas',
    participant: {
      participantId: 'participant-001',
      firstName: 'Gilberto',
      lastName: 'Natal Robles',
      fullName: 'Gilberto Natal Robles',
      age: 63,
      birthDate: '1962-02-04',
      city: 'San Juan',
      state: 'PR',
      phone: '(787) 555-0104',
      email: 'gilberto.natal@example.org',
      preferredLanguage: 'Espanol',
      insuranceType: 'Plan Vital',
      employmentStatus: 'Retirado',
      incomeSource: 'Seguro social',
      housingType: 'Alquiler',
    },
    services: [
      {
        caseServiceId: 'cs-001',
        serviceId: 'service-meals',
        serviceName: 'Apoyo nutricional',
        serviceCode: 'NUTR',
        proposalId: 'proposal-av26',
        proposalName: 'Acceso Vital 2026',
        proposalCode: 'AV26',
        status: 'active',
        priority: 'high',
        dateAssigned: '2026-03-11',
        dateStarted: '2026-03-12',
        outcome: 'Entregas semanales aprobadas por 90 dias.',
      },
      {
        caseServiceId: 'cs-002',
        serviceId: 'service-legal',
        serviceName: 'Orientacion legal',
        serviceCode: 'LEGAL',
        proposalId: 'proposal-rl26',
        proposalName: 'Ruta Legal 2026',
        proposalCode: 'RL26',
        status: 'pending',
        priority: 'medium',
        dateAssigned: '2026-03-12',
      },
    ],
    notesCount: 6,
    documentsCount: 4,
    historyCount: 15,
    nextStep: 'Confirmar cita legal y validar continuidad del plan alimentario.',
    recentHistory: [
      {
        historyId: 'history-001',
        actionType: 'note_added',
        description: 'Se documento seguimiento de seguridad alimentaria en visita telefonica.',
        createdAt: '2026-04-04T10:20:00',
      },
      {
        historyId: 'history-002',
        actionType: 'service_assigned',
        description: 'Se asigno Orientacion legal para renovacion de identificacion.',
        createdAt: '2026-03-12T14:05:00',
      },
      {
        historyId: 'history-003',
        actionType: 'document_uploaded',
        description: 'Se cargo evidencia medica para validacion de prioridad.',
        createdAt: '2026-03-11T16:42:00',
      },
    ],
  },
  {
    caseId: 'case-002',
    caseNumber: 'Apr26-399112',
    status: 'active',
    isSensitive: false,
    intakeDate: '2026-04-01',
    summary: 'Familia en riesgo de perdida de vivienda con necesidad de estabilizacion inmediata y referido medico.',
    caseManager: 'Jose Rivera',
    participant: {
      participantId: 'participant-002',
      firstName: 'Ana',
      lastName: 'Morales Ortiz',
      fullName: 'Ana Morales Ortiz',
      age: 54,
      birthDate: '1971-08-17',
      city: 'Ponce',
      state: 'PR',
      phone: '(787) 555-0188',
      email: 'ana.morales@example.org',
      preferredLanguage: 'Espanol',
      insuranceType: 'Privado',
      employmentStatus: 'Subempleada',
      incomeSource: 'Trabajo parcial',
      housingType: 'Hipoteca atrasada',
    },
    services: [
      {
        caseServiceId: 'cs-003',
        serviceId: 'service-housing',
        serviceName: 'Vivienda de emergencia',
        serviceCode: 'HOME',
        proposalId: 'proposal-av26',
        proposalName: 'Acceso Vital 2026',
        proposalCode: 'AV26',
        status: 'active',
        priority: 'urgent',
        dateAssigned: '2026-04-01',
        dateStarted: '2026-04-01',
        outcome: 'Alojamiento temporal coordinado por siete noches.',
      },
      {
        caseServiceId: 'cs-004',
        serviceId: 'service-medical',
        serviceName: 'Referido medico',
        serviceCode: 'MED',
        proposalId: 'proposal-sc26',
        proposalName: 'Salud en Comunidad 2026',
        proposalCode: 'SC26',
        status: 'active',
        priority: 'high',
        dateAssigned: '2026-04-02',
        dateStarted: '2026-04-03',
        outcome: 'Consulta primaria confirmada para manejo de hipertension.',
      },
    ],
    notesCount: 4,
    documentsCount: 2,
    historyCount: 9,
    nextStep: 'Revisar plan de vivienda de transicion y registrar plan medico post-consulta.',
    recentHistory: [
      {
        historyId: 'history-004',
        actionType: 'service_started',
        description: 'Se activo hospedaje temporal y entrega de kit de entrada.',
        createdAt: '2026-04-03T09:15:00',
      },
      {
        historyId: 'history-005',
        actionType: 'service_assigned',
        description: 'Se coordino referido medico por condicion cronica descompensada.',
        createdAt: '2026-04-02T12:30:00',
      },
      {
        historyId: 'history-006',
        actionType: 'case_created',
        description: 'Se abrio expediente con prioridad urgente por inestabilidad residencial.',
        createdAt: '2026-04-01T08:10:00',
      },
    ],
  },
  {
    caseId: 'case-003',
    caseNumber: 'Mar26-398017',
    status: 'pending',
    isSensitive: true,
    intakeDate: '2026-03-11',
    summary: 'Participante con retraso en identificacion oficial y barreras de acceso a beneficios.',
    caseManager: 'Maria Torres',
    participant: {
      participantId: 'participant-003',
      firstName: 'Lourdes',
      lastName: 'Lopez Reyes',
      fullName: 'Lourdes Lopez Reyes',
      age: 63,
      birthDate: '1962-10-09',
      city: 'Bayamon',
      state: 'PR',
      phone: '(787) 555-0190',
      email: 'lourdes.lopez@example.org',
      preferredLanguage: 'Espanol',
      insuranceType: 'Plan Vital',
      employmentStatus: 'Desempleada',
      incomeSource: 'PAN',
      housingType: 'Vive con familiar',
    },
    services: [
      {
        caseServiceId: 'cs-005',
        serviceId: 'service-docs',
        serviceName: 'Recuperacion de documentos',
        serviceCode: 'DOCS',
        proposalId: 'proposal-rl26',
        proposalName: 'Ruta Legal 2026',
        proposalCode: 'RL26',
        status: 'pending',
        priority: 'high',
        dateAssigned: '2026-03-13',
      },
      {
        caseServiceId: 'cs-006',
        serviceId: 'service-psych',
        serviceName: 'Acompanamiento psicosocial',
        serviceCode: 'PSY',
        proposalId: 'proposal-sc26',
        proposalName: 'Salud en Comunidad 2026',
        proposalCode: 'SC26',
        status: 'referred',
        priority: 'medium',
        dateAssigned: '2026-03-14',
        outcome: 'Referido enviado a proveedor comunitario externo.',
      },
    ],
    notesCount: 3,
    documentsCount: 1,
    historyCount: 7,
    nextStep: 'Completar validacion de identidad para activar beneficios y cerrar referido externo.',
    recentHistory: [
      {
        historyId: 'history-007',
        actionType: 'case_updated',
        description: 'Se marco el expediente como pendiente por documentos incompletos.',
        createdAt: '2026-03-20T15:22:00',
      },
      {
        historyId: 'history-008',
        actionType: 'service_assigned',
        description: 'Se solicito apoyo de documentacion para recuperar identificacion oficial.',
        createdAt: '2026-03-13T11:48:00',
      },
      {
        historyId: 'history-009',
        actionType: 'note_added',
        description: 'Se registro entrevista inicial y barreras de transporte.',
        createdAt: '2026-03-11T17:02:00',
      },
    ],
  },
  {
    caseId: 'case-004',
    caseNumber: 'Feb26-397285',
    status: 'closed',
    isSensitive: false,
    intakeDate: '2026-02-19',
    closeDate: '2026-03-28',
    summary: 'Caso estabilizado tras acompanamiento psicosocial y apoyo nutricional temporero.',
    caseManager: 'Carlos Rivera',
    participant: {
      participantId: 'participant-004',
      firstName: 'Carlos',
      lastName: 'Negron Sanchez',
      fullName: 'Carlos Negron Sanchez',
      age: 61,
      birthDate: '1964-06-12',
      city: 'Caguas',
      state: 'PR',
      phone: '(787) 555-0155',
      email: 'carlos.negron@example.org',
      preferredLanguage: 'Espanol',
      insuranceType: 'Medicare',
      employmentStatus: 'Incapacidad',
      incomeSource: 'SSI',
      housingType: 'Alquiler estable',
    },
    services: [
      {
        caseServiceId: 'cs-007',
        serviceId: 'service-psych',
        serviceName: 'Acompanamiento psicosocial',
        serviceCode: 'PSY',
        proposalId: 'proposal-sc26',
        proposalName: 'Salud en Comunidad 2026',
        proposalCode: 'SC26',
        status: 'completed',
        priority: 'medium',
        dateAssigned: '2026-02-19',
        dateStarted: '2026-02-20',
        dateCompleted: '2026-03-25',
        outcome: 'Seguimiento completado con alta voluntaria.',
      },
      {
        caseServiceId: 'cs-008',
        serviceId: 'service-meals',
        serviceName: 'Apoyo nutricional',
        serviceCode: 'NUTR',
        proposalId: 'proposal-av26',
        proposalName: 'Acceso Vital 2026',
        proposalCode: 'AV26',
        status: 'completed',
        priority: 'low',
        dateAssigned: '2026-02-21',
        dateStarted: '2026-02-22',
        dateCompleted: '2026-03-10',
        outcome: 'Plan de alimentos transitorio finalizado.',
      },
    ],
    notesCount: 5,
    documentsCount: 3,
    historyCount: 12,
    nextStep: 'Mantener caso archivado y disponible para auditoria.',
    recentHistory: [
      {
        historyId: 'history-010',
        actionType: 'status_changed',
        description: 'Expediente cerrado luego de completar plan de estabilizacion.',
        createdAt: '2026-03-28T13:00:00',
      },
      {
        historyId: 'history-011',
        actionType: 'service_completed',
        description: 'Se completo acompanamiento psicosocial con alta voluntaria.',
        createdAt: '2026-03-25T16:10:00',
      },
      {
        historyId: 'history-012',
        actionType: 'document_uploaded',
        description: 'Se adjunto evidencia de cierre y plan de seguimiento.',
        createdAt: '2026-03-25T15:30:00',
      },
    ],
  },
  {
    caseId: 'case-005',
    caseNumber: 'Jan26-391004',
    status: 'active',
    isSensitive: true,
    intakeDate: '2026-01-20',
    summary: 'Madre cuidadora con alta carga emocional y necesidad de apoyo comunitario sostenido.',
    caseManager: 'Ana Perez',
    participant: {
      participantId: 'participant-005',
      firstName: 'Sonia',
      lastName: 'Lopez Cruz',
      fullName: 'Sonia Lopez Cruz',
      age: 45,
      birthDate: '1980-05-23',
      city: 'Arecibo',
      state: 'PR',
      phone: '(787) 555-0117',
      email: 'sonia.lopez@example.org',
      preferredLanguage: 'Espanol',
      insuranceType: 'Plan Vital',
      employmentStatus: 'Desempleada',
      incomeSource: 'Cuidado no remunerado',
      housingType: 'Propiedad familiar',
    },
    services: [
      {
        caseServiceId: 'cs-009',
        serviceId: 'service-psych',
        serviceName: 'Acompanamiento psicosocial',
        serviceCode: 'PSY',
        proposalId: 'proposal-sc26',
        proposalName: 'Salud en Comunidad 2026',
        proposalCode: 'SC26',
        status: 'active',
        priority: 'high',
        dateAssigned: '2026-01-20',
        dateStarted: '2026-01-22',
        outcome: 'Sesiones quincenales activas.',
      },
      {
        caseServiceId: 'cs-010',
        serviceId: 'service-docs',
        serviceName: 'Recuperacion de documentos',
        serviceCode: 'DOCS',
        proposalId: 'proposal-rl26',
        proposalName: 'Ruta Legal 2026',
        proposalCode: 'RL26',
        status: 'active',
        priority: 'medium',
        dateAssigned: '2026-02-05',
        dateStarted: '2026-02-08',
        outcome: 'Documentos de dependientes en proceso de validacion.',
      },
    ],
    notesCount: 8,
    documentsCount: 5,
    historyCount: 18,
    nextStep: 'Actualizar plan familiar y validar entrega de documentos faltantes.',
    recentHistory: [
      {
        historyId: 'history-013',
        actionType: 'note_added',
        description: 'Se documento riesgo de agotamiento del cuidador principal.',
        createdAt: '2026-04-05T08:40:00',
      },
      {
        historyId: 'history-014',
        actionType: 'service_started',
        description: 'Acompanamiento psicosocial continua con sesiones quincenales.',
        createdAt: '2026-03-21T10:15:00',
      },
      {
        historyId: 'history-015',
        actionType: 'case_viewed',
        description: 'Supervisor reviso notas sensibles para auditoria interna.',
        createdAt: '2026-03-18T16:05:00',
      },
    ],
  },
  {
    caseId: 'case-006',
    caseNumber: 'Dec25-392807',
    status: 'pending',
    isSensitive: false,
    intakeDate: '2025-12-09',
    summary: 'Participante en transicion laboral pendiente de activacion de ruta de empleo y cierre de vivienda.',
    caseManager: 'Esteban Cruz',
    participant: {
      participantId: 'participant-006',
      firstName: 'Jorge',
      lastName: 'Diaz Santiago',
      fullName: 'Jorge Diaz Santiago',
      age: 62,
      birthDate: '1963-11-14',
      city: 'Mayaguez',
      state: 'PR',
      phone: '(787) 555-0142',
      email: 'jorge.diaz@example.org',
      preferredLanguage: 'Espanol',
      insuranceType: 'Ninguno',
      employmentStatus: 'Desempleado',
      incomeSource: 'Apoyo familiar',
      housingType: 'Alojamiento transitorio',
    },
    services: [
      {
        caseServiceId: 'cs-011',
        serviceId: 'service-employment',
        serviceName: 'Ruta laboral',
        serviceCode: 'WORK',
        proposalId: 'proposal-pu25',
        proposalName: 'Puentes de Empleo 2025',
        proposalCode: 'PE25',
        status: 'pending',
        priority: 'medium',
        dateAssigned: '2025-12-12',
      },
      {
        caseServiceId: 'cs-012',
        serviceId: 'service-housing',
        serviceName: 'Vivienda de emergencia',
        serviceCode: 'HOME',
        proposalId: 'proposal-av26',
        proposalName: 'Acceso Vital 2026',
        proposalCode: 'AV26',
        status: 'cancelled',
        priority: 'low',
        dateAssigned: '2026-01-04',
        outcome: 'Solicitud cancelada tras reubicacion familiar.',
      },
    ],
    notesCount: 2,
    documentsCount: 2,
    historyCount: 6,
    nextStep: 'Validar si el participante desea reactivar ruta laboral o cerrar expediente.',
    recentHistory: [
      {
        historyId: 'history-016',
        actionType: 'service_cancelled',
        description: 'Se cancelo solicitud de vivienda por alternativa familiar.',
        createdAt: '2026-01-07T11:20:00',
      },
      {
        historyId: 'history-017',
        actionType: 'case_updated',
        description: 'Expediente continua pendiente por decision del participante.',
        createdAt: '2026-01-05T09:50:00',
      },
      {
        historyId: 'history-018',
        actionType: 'case_created',
        description: 'Se abrio expediente para transicion laboral al cierre del 2025.',
        createdAt: '2025-12-09T10:05:00',
      },
    ],
  },
];

export const savedReports: SavedReport[] = [
  {
    reportId: 'report-001',
    reportName: 'Servicios por propuesta',
    reportType: 'Operacional',
    description: 'Resume participantes, casos y asignaciones por propuesta con detalle de servicio.',
    generatedAt: '2026-04-05T08:15:00',
    generatedBy: 'Equipo de supervision',
  },
  {
    reportId: 'report-002',
    reportName: 'Casos activos por gestor',
    reportType: 'Supervision',
    description: 'Distribuye la carga actual por manejador y muestra expedientes sensibles.',
    generatedAt: '2026-04-04T16:40:00',
    generatedBy: 'Lucia Salas',
  },
  {
    reportId: 'report-003',
    reportName: 'Servicios completados del mes',
    reportType: 'Auditoria',
    description: 'Detalle de cierres por fecha, resultado y propuesta financiadora.',
    generatedAt: '2026-04-03T11:05:00',
    generatedBy: 'Maria Torres',
  },
];

export const caseNotesByCaseNumber: Record<string, CaseNote[]> = {
  'Mar26-398023': [
    {
      noteId: 'note-001',
      noteType: 'seguimiento',
      content: 'Se confirmo necesidad continua de apoyo alimentario y se coordino llamada de verificacion para la proxima semana.',
      isSensitive: false,
      createdBy: 'Lucia Salas',
      createdAt: '2026-04-04T10:20:00',
    },
    {
      noteId: 'note-002',
      noteType: 'legal',
      content: 'Participante requiere orientacion para renovar identificacion y recopilar evidencia medica asociada.',
      isSensitive: true,
      createdBy: 'Lucia Salas',
      createdAt: '2026-03-12T14:00:00',
    },
  ],
  'Apr26-399112': [
    {
      noteId: 'note-003',
      noteType: 'intake',
      content: 'Se documento riesgo inmediato de perdida de vivienda y se activo ruta de emergencia el mismo dia del ingreso.',
      isSensitive: false,
      createdBy: 'Jose Rivera',
      createdAt: '2026-04-01T08:25:00',
    },
    {
      noteId: 'note-004',
      noteType: 'salud',
      content: 'Se registro orientacion sobre adherencia a medicamentos y preparacion para consulta primaria.',
      isSensitive: false,
      createdBy: 'Jose Rivera',
      createdAt: '2026-04-03T09:45:00',
    },
  ],
  'Mar26-398017': [
    {
      noteId: 'note-005',
      noteType: 'documentacion',
      content: 'Falta certificacion oficial para completar activacion de beneficios y continuar con el plan legal.',
      isSensitive: true,
      createdBy: 'Maria Torres',
      createdAt: '2026-03-20T15:22:00',
    },
    {
      noteId: 'note-006',
      noteType: 'seguimiento',
      content: 'Se identificaron barreras de transporte y necesidad de apoyo para acudir a la cita externa.',
      isSensitive: false,
      createdBy: 'Maria Torres',
      createdAt: '2026-03-11T17:02:00',
    },
  ],
  'Feb26-397285': [
    {
      noteId: 'note-007',
      noteType: 'cierre',
      content: 'Caso listo para cierre luego de completar plan de estabilizacion y validar red de apoyo.',
      isSensitive: false,
      createdBy: 'Carlos Rivera',
      createdAt: '2026-03-28T12:30:00',
    },
    {
      noteId: 'note-008',
      noteType: 'psicosocial',
      content: 'El participante reporta mejoria sostenida y desea concluir el seguimiento actual.',
      isSensitive: false,
      createdBy: 'Carlos Rivera',
      createdAt: '2026-03-25T15:55:00',
    },
  ],
  'Jan26-391004': [
    {
      noteId: 'note-009',
      noteType: 'familiar',
      content: 'Se observa agotamiento del cuidador principal. Se recomienda mantener frecuencia de acompanamiento.',
      isSensitive: true,
      createdBy: 'Ana Perez',
      createdAt: '2026-04-05T08:40:00',
    },
    {
      noteId: 'note-010',
      noteType: 'documentacion',
      content: 'Se solicitaron documentos faltantes de dependientes para completar expediente familiar.',
      isSensitive: false,
      createdBy: 'Ana Perez',
      createdAt: '2026-02-08T11:15:00',
    },
  ],
  'Dec25-392807': [
    {
      noteId: 'note-011',
      noteType: 'empleo',
      content: 'El participante solicito tiempo adicional antes de reactivar su ruta laboral.',
      isSensitive: false,
      createdBy: 'Esteban Cruz',
      createdAt: '2026-01-05T09:50:00',
    },
    {
      noteId: 'note-012',
      noteType: 'vivienda',
      content: 'Se cancelo solicitud de vivienda tras solucion temporal con familiares.',
      isSensitive: false,
      createdBy: 'Esteban Cruz',
      createdAt: '2026-01-07T11:20:00',
    },
  ],
};

export const caseDocumentsByCaseNumber: Record<string, CaseDocument[]> = {
  'Mar26-398023': [
    {
      documentId: 'doc-001',
      documentType: 'identificacion',
      fileName: 'id-frontal-gilberto.pdf',
      mimeType: 'application/pdf',
      isSensitive: true,
      uploadedBy: 'Lucia Salas',
      createdAt: '2026-03-11T16:42:00',
    },
    {
      documentId: 'doc-002',
      documentType: 'medico',
      fileName: 'certificacion-medica-marzo.pdf',
      mimeType: 'application/pdf',
      isSensitive: true,
      uploadedBy: 'Lucia Salas',
      createdAt: '2026-03-11T16:45:00',
    },
  ],
  'Apr26-399112': [
    {
      documentId: 'doc-003',
      documentType: 'vivienda',
      fileName: 'aviso-atraso-hipoteca.pdf',
      mimeType: 'application/pdf',
      isSensitive: false,
      uploadedBy: 'Jose Rivera',
      createdAt: '2026-04-01T09:10:00',
    },
    {
      documentId: 'doc-004',
      documentType: 'salud',
      fileName: 'referido-medico-inicial.pdf',
      mimeType: 'application/pdf',
      isSensitive: false,
      uploadedBy: 'Jose Rivera',
      createdAt: '2026-04-02T12:40:00',
    },
  ],
  'Mar26-398017': [
    {
      documentId: 'doc-005',
      documentType: 'documentacion',
      fileName: 'solicitud-recuperacion-identificacion.pdf',
      mimeType: 'application/pdf',
      isSensitive: true,
      uploadedBy: 'Maria Torres',
      createdAt: '2026-03-13T11:48:00',
    },
  ],
  'Feb26-397285': [
    {
      documentId: 'doc-006',
      documentType: 'cierre',
      fileName: 'plan-seguimiento-cierre.pdf',
      mimeType: 'application/pdf',
      isSensitive: false,
      uploadedBy: 'Carlos Rivera',
      createdAt: '2026-03-25T15:30:00',
    },
    {
      documentId: 'doc-007',
      documentType: 'servicio',
      fileName: 'alta-psicosocial.pdf',
      mimeType: 'application/pdf',
      isSensitive: false,
      uploadedBy: 'Carlos Rivera',
      createdAt: '2026-03-25T15:35:00',
    },
  ],
  'Jan26-391004': [
    {
      documentId: 'doc-008',
      documentType: 'familia',
      fileName: 'plan-familiar-actualizado.pdf',
      mimeType: 'application/pdf',
      isSensitive: true,
      uploadedBy: 'Ana Perez',
      createdAt: '2026-04-05T09:00:00',
    },
    {
      documentId: 'doc-009',
      documentType: 'dependientes',
      fileName: 'documentos-dependientes.zip',
      mimeType: 'application/zip',
      isSensitive: true,
      uploadedBy: 'Ana Perez',
      createdAt: '2026-02-08T11:30:00',
    },
  ],
  'Dec25-392807': [
    {
      documentId: 'doc-010',
      documentType: 'empleo',
      fileName: 'plan-ruta-laboral.pdf',
      mimeType: 'application/pdf',
      isSensitive: false,
      uploadedBy: 'Esteban Cruz',
      createdAt: '2025-12-12T10:15:00',
    },
    {
      documentId: 'doc-011',
      documentType: 'vivienda',
      fileName: 'cancelacion-solicitud-vivienda.pdf',
      mimeType: 'application/pdf',
      isSensitive: false,
      uploadedBy: 'Esteban Cruz',
      createdAt: '2026-01-07T11:25:00',
    },
  ],
};

export function getCaseByNumber(caseNumber: string) {
  return cases.find((item) => item.caseNumber === caseNumber) ?? null;
}

export function getCaseDetails(caseNumber: string) {
  const caseItem = getCaseByNumber(caseNumber);

  if (!caseItem) {
    return null;
  }

  return {
    caseItem,
    notes: caseNotesByCaseNumber[caseNumber] ?? [],
    documents: caseDocumentsByCaseNumber[caseNumber] ?? [],
    history: caseItem.recentHistory,
  } satisfies CaseDetailsRecord;
}
