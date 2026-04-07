import { cases, proposals, type CaseItem, type CaseServiceStatus, type ProposalStatus } from '@/lib/mockCases';

export type ParticipantDirectoryItem = {
  participantId: string;
  fullName: string;
  city: string;
  state: string;
  phone: string;
  preferredLanguage: string;
  primaryManager: string;
  totalCases: number;
  activeCases: number;
  pendingCases: number;
  openServices: number;
  sensitiveCases: number;
  latestCaseNumber: string;
};

type InternalParticipantDirectoryItem = ParticipantDirectoryItem & {
  latestIntakeDate: string;
};

export type ProposalCaseSummary = {
  caseId: string;
  caseNumber: string;
  participantId: string;
  participantName: string;
  city: string;
  caseManager: string;
  caseStatus: CaseItem['status'];
  services: Array<{
    caseServiceId: string;
    serviceId: string;
    serviceCode: string;
    serviceName: string;
    status: CaseServiceStatus;
  }>;
};

export type ProposalSnapshot = {
  proposalId: string;
  proposalName: string;
  proposalCode: string;
  description: string;
  funder: string;
  status: ProposalStatus;
  startDate: string;
  endDate: string;
  participantCount: number;
  caseCount: number;
  openAssignments: number;
  completedAssignments: number;
  services: Array<{
    serviceId: string;
    serviceName: string;
    serviceCode: string;
    description: string;
    assignmentCount: number;
    openCount: number;
    completedCount: number;
  }>;
  relatedCases: ProposalCaseSummary[];
};

function isOpenService(status: string) {
  return status === 'active' || status === 'pending';
}

export function getCaseMetrics(sourceCases = cases) {
  const assignments = sourceCases.flatMap((item) => item.services);

  return {
    totalCases: sourceCases.length,
    activeCases: sourceCases.filter((item) => item.status === 'active').length,
    pendingCases: sourceCases.filter((item) => item.status === 'pending').length,
    closedCases: sourceCases.filter((item) => item.status === 'closed').length,
    sensitiveCases: sourceCases.filter((item) => item.isSensitive).length,
    openAssignments: assignments.filter((service) => isOpenService(service.status)).length,
    completedAssignments: assignments.filter((service) => service.status === 'completed').length,
    participantCount: new Set(sourceCases.map((item) => item.participant.participantId)).size,
    activeProposals: proposals.filter((proposal) => proposal.status === 'active').length,
  };
}

export function getParticipantsDirectory(sourceCases = cases): ParticipantDirectoryItem[] {
  const participantsMap = new Map<string, InternalParticipantDirectoryItem>();

  sourceCases.forEach((item) => {
    const existing = participantsMap.get(item.participant.participantId);
    const openServices = item.services.filter((service) => isOpenService(service.status)).length;

    if (!existing) {
      participantsMap.set(item.participant.participantId, {
        participantId: item.participant.participantId,
        fullName: item.participant.fullName,
        city: item.participant.city,
        state: item.participant.state,
        phone: item.participant.phone,
        preferredLanguage: item.participant.preferredLanguage,
        primaryManager: item.caseManager,
        totalCases: 1,
        activeCases: item.status === 'active' ? 1 : 0,
        pendingCases: item.status === 'pending' ? 1 : 0,
        openServices,
        sensitiveCases: item.isSensitive ? 1 : 0,
        latestCaseNumber: item.caseNumber,
        latestIntakeDate: item.intakeDate,
      });
      return;
    }

    existing.totalCases += 1;
    existing.activeCases += item.status === 'active' ? 1 : 0;
    existing.pendingCases += item.status === 'pending' ? 1 : 0;
    existing.openServices += openServices;
    existing.sensitiveCases += item.isSensitive ? 1 : 0;
    if (item.intakeDate > existing.latestIntakeDate) {
      existing.latestIntakeDate = item.intakeDate;
      existing.latestCaseNumber = item.caseNumber;
      existing.primaryManager = item.caseManager;
    }
  });

  return Array.from(participantsMap.values())
    .map(({ latestIntakeDate: _latestIntakeDate, ...participant }) => participant)
    .sort((left, right) => left.fullName.localeCompare(right.fullName, 'es'));
}

export function getProposalSnapshots(sourceCases = cases): ProposalSnapshot[] {
  return proposals.map((proposal) => {
    const relatedCases = sourceCases
      .filter((item) => item.services.some((service) => service.proposalId === proposal.proposalId))
      .map((item) => ({
        caseId: item.caseId,
        caseNumber: item.caseNumber,
        participantId: item.participant.participantId,
        participantName: item.participant.fullName,
        city: item.participant.city,
        caseManager: item.caseManager,
        caseStatus: item.status,
        services: item.services
          .filter((service) => service.proposalId === proposal.proposalId)
          .map((service) => ({
            caseServiceId: service.caseServiceId,
            serviceId: service.serviceId,
            serviceCode: service.serviceCode,
            serviceName: service.serviceName,
            status: service.status,
          })),
      }));

    const assignments = relatedCases.flatMap((item) => item.services);

    return {
      proposalId: proposal.proposalId,
      proposalName: proposal.proposalName,
      proposalCode: proposal.proposalCode,
      description: proposal.description,
      funder: proposal.funder,
      status: proposal.status,
      startDate: proposal.startDate,
      endDate: proposal.endDate,
      participantCount: new Set(
        sourceCases
          .filter((item) => item.services.some((service) => service.proposalId === proposal.proposalId))
          .map((item) => item.participant.participantId),
      ).size,
      caseCount: relatedCases.length,
      openAssignments: assignments.filter((service) => isOpenService(service.status)).length,
      completedAssignments: assignments.filter((service) => service.status === 'completed').length,
      services: proposal.services.map((service) => {
        const serviceAssignments = assignments.filter((assignment) => assignment.serviceId === service.serviceId);

        return {
          serviceId: service.serviceId,
          serviceName: service.serviceName,
          serviceCode: service.serviceCode,
          description: service.description,
          assignmentCount: serviceAssignments.length,
          openCount: serviceAssignments.filter((assignment) => isOpenService(assignment.status)).length,
          completedCount: serviceAssignments.filter((assignment) => assignment.status === 'completed').length,
        };
      }),
      relatedCases,
    };
  });
}
