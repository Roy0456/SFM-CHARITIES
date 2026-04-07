import { notFound } from 'next/navigation';
import { CaseDetailsWorkspace } from '@/components/CaseDetailsWorkspace';
import { getCaseDetails } from '@/lib/mockCases';

export default function CaseDetailsPage({ params }: { params: { caseNumber: string } }) {
  const details = getCaseDetails(params.caseNumber);

  if (!details) {
    notFound();
  }

  return <CaseDetailsWorkspace details={details} />;
}
