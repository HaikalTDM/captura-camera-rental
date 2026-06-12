interface AuditEntry {
    tool_name: string;
    action: string;
    target_id?: string;
    details: Record<string, unknown>;
    timestamp: string;
}
export declare function auditLog(entry: Omit<AuditEntry, 'timestamp'>): void;
export {};
//# sourceMappingURL=logger.d.ts.map