export function extractPossibleOrderId(question: string): string | undefined {
  const match = question.match(/\b\d{6,}\b/);
  return match ? match[0] : undefined;
}

