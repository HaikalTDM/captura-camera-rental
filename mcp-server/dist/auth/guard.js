import { isAuthRequired, validateApiKey } from './api-key.js';
export var AccessLevel;
(function (AccessLevel) {
    AccessLevel["PUBLIC_READ"] = "PUBLIC_READ";
    AccessLevel["AUTH_READ"] = "AUTH_READ";
    AccessLevel["ADMIN_WRITE"] = "ADMIN_WRITE";
})(AccessLevel || (AccessLevel = {}));
export class AuthError extends Error {
    constructor(message) {
        super(message);
        this.name = 'AuthError';
    }
}
export function requireAccess(toolName, accessLevel, apiKey) {
    if (!isAuthRequired()) {
        return;
    }
    if (accessLevel === AccessLevel.PUBLIC_READ) {
        return;
    }
    if (!apiKey) {
        throw new AuthError(`Authentication required for tool "${toolName}". Provide _apiKey parameter.`);
    }
    if (!validateApiKey(apiKey)) {
        throw new AuthError(`Invalid API key for tool "${toolName}".`);
    }
}
export const AUTH_TOOLS = {
    'captura.cameras.list': AccessLevel.PUBLIC_READ,
    'captura.cameras.get': AccessLevel.PUBLIC_READ,
    'captura.cameras.check_availability': AccessLevel.PUBLIC_READ,
    'captura.cameras.admin.create': AccessLevel.ADMIN_WRITE,
    'captura.cameras.admin.update': AccessLevel.ADMIN_WRITE,
    'captura.cameras.admin.set_availability': AccessLevel.ADMIN_WRITE,
    'captura.bookings.list': AccessLevel.AUTH_READ,
    'captura.bookings.get': AccessLevel.AUTH_READ,
    'captura.bookings.search': AccessLevel.AUTH_READ,
    'captura.bookings.today_returns': AccessLevel.AUTH_READ,
    'captura.bookings.admin.create': AccessLevel.ADMIN_WRITE,
    'captura.bookings.admin.approve': AccessLevel.ADMIN_WRITE,
    'captura.bookings.admin.reject': AccessLevel.ADMIN_WRITE,
    'captura.bookings.admin.cancel': AccessLevel.ADMIN_WRITE,
    'captura.bookings.admin.mark_pickup': AccessLevel.ADMIN_WRITE,
    'captura.bookings.admin.mark_return': AccessLevel.ADMIN_WRITE,
    'captura.bookings.admin.complete': AccessLevel.ADMIN_WRITE,
    'captura.bookings.admin.delete': AccessLevel.ADMIN_WRITE,
    'captura.bookings.overdue': AccessLevel.AUTH_READ,
    'captura.bookings.next_actions': AccessLevel.AUTH_READ,
    'captura.bookings.admin.smart_create': AccessLevel.ADMIN_WRITE,
    'captura.bookings.admin.bulk_approve': AccessLevel.ADMIN_WRITE,
    'captura.customers.list': AccessLevel.AUTH_READ,
    'captura.customers.get': AccessLevel.AUTH_READ,
    'captura.customers.admin.update': AccessLevel.ADMIN_WRITE,
    'captura.payments.admin.record': AccessLevel.ADMIN_WRITE,
    'captura.payments.admin.mark_deposit_refunded': AccessLevel.ADMIN_WRITE,
    'captura.invoices.admin.generate': AccessLevel.ADMIN_WRITE,
    'captura.admin.get_settings': AccessLevel.PUBLIC_READ,
    'captura.admin.update_settings': AccessLevel.ADMIN_WRITE,
    'captura.admin.dashboard_summary': AccessLevel.AUTH_READ,
    'captura.admin.revenue_report': AccessLevel.AUTH_READ,
};
//# sourceMappingURL=guard.js.map