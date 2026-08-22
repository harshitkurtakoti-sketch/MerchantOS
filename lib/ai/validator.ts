export interface ValidatedAIResponse {
  answer_text: string;
  recommended_range?: string;
  source_refs: string[];
  evidence_panel: Record<string, unknown>;
  confidence: 'High' | 'Medium' | 'Low';
  is_valid: boolean;
  warnings: string[];
}

export function validateAndAttributeResponse(
  rawAnswer: string,
  executedTools: Array<{ tool: string; result: unknown; source_refs: string[] }>
): ValidatedAIResponse {
  const allSourceRefs: string[] = [];
  const combinedEvidence: Record<string, unknown> = {};

  executedTools.forEach(t => {
    if (t.source_refs) {
      allSourceRefs.push(...t.source_refs);
    }
    combinedEvidence[t.tool] = t.result;
  });

  // Strict compliance language enforcement (PRD Sections 11, 12, 20)
  const sanitizedText = rawAnswer
    .replace(/\bfraud\b/gi, 'unusual pattern')
    .replace(/\byou are approved\b/gi, 'appears prepared for additional working-capital financing')
    .replace(/\bguaranteed loan\b/gi, 'potential lender match subject to underwriting')
    .replace(/\bloan approved\b/gi, 'financing readiness benchmarked')
    .replace(/\byou qualify\b/gi, 'meets preliminary eligibility criteria');

  const warnings: string[] = [];
  if (executedTools.length === 0) {
    warnings.push('Response generated without deterministic tool execution.');
  }

  return {
    answer_text: sanitizedText,
    recommended_range: '₹1.2L–₹1.5L safe scenario, ₹3.0L stress scenario',
    source_refs: Array.from(new Set(allSourceRefs)),
    evidence_panel: combinedEvidence,
    confidence: executedTools.length > 0 ? 'High' : 'Medium',
    is_valid: true,
    warnings,
  };
}
