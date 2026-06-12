export function auditLog(entry) {
    const logEntry = {
        ...entry,
        timestamp: new Date().toISOString(),
    };
    console.log(JSON.stringify({ ...logEntry, _audit: true }));
}
//# sourceMappingURL=logger.js.map