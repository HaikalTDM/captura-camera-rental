interface AuditEntry {
  tool_name: string;
  action: string;
  target_id?: string;
  details: Record<string, unknown>;
  timestamp: string;
}

export function auditLog(entry: Omit<AuditEntry, 'timestamp'>): void {
  const logEntry: AuditEntry = {
    ...entry,
    timestamp: new Date().toISOString(),
  };
  console.log(JSON.stringify({ ...logEntry, _audit: true }));
}
