import {InspectionProps} from '../../types/inspection';

export function parseInspectionData(
  inspection: InspectionProps,
): InspectionProps {
  const data: InspectionProps = {
    id: parseInt(String(inspection?.id).replace('n', '')),
    acceptedAt: parseInt(String(inspection?.acceptedAt).replace('n', '')),
    createdAt: parseInt(String(inspection?.createdAt).replace('n', '')),
    inspectedAt: parseInt(String(inspection?.inspectedAt).replace('n', '')),
    inspectedAtEra: parseInt(
      String(inspection?.inspectedAtEra).replace('n', ''),
    ),
    inspector: inspection?.inspector,
    invalidatedAt: parseInt(String(inspection?.invalidatedAt).replace('n', '')),
    proofPhoto: inspection?.proofPhoto,
    regenerationScore: parseInt(
      String(inspection?.regenerationScore).replace('n', '')
    ),
    regenerator: inspection?.regenerator,
    report: inspection?.report,
    status: parseInt(String(inspection?.status).replace('n', '')),
    treesResult: parseInt(String(inspection?.treesResult).replace('n', '')),
    validationsCount: parseInt(
      String(inspection?.validationsCount).replace('n', ''),
    ),
  };

  return data;
}
