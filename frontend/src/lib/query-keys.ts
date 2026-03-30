/**
 * Centralized Query Keys Factory
 * Pattern: [resource, scope, { filters/id }]
 */
export const queryKeys = {
    warehouse: {
        all: ['warehouse'] as const,
        inventory: {
            all: () => [...queryKeys.warehouse.all, 'inventory'] as const,
            lists: () => [...queryKeys.warehouse.inventory.all(), 'list'] as const,
            list: (filters: any) => [...queryKeys.warehouse.inventory.lists(), { filters }] as const,
            details: () => [...queryKeys.warehouse.inventory.all(), 'detail'] as const,
            detail: (id: string | number) => [...queryKeys.warehouse.inventory.details(), Number(id)] as const,
        },
        import: {
            all: () => [...queryKeys.warehouse.all, 'import'] as const,
            lists: () => [...queryKeys.warehouse.import.all(), 'list'] as const,
        }
    },
    order: {
        all: ['orders'] as const,
        lists: () => [...queryKeys.order.all, 'list'] as const,
        list: (filters: any) => [...queryKeys.order.lists(), { filters }] as const,
        details: () => [...queryKeys.order.all, 'detail'] as const,
        detail: (id: string | number) => [...queryKeys.order.details(), Number(id)] as const,
    },
    reception: {
        all: ['reception'] as const,
        lists: () => [...queryKeys.reception.all, 'list'] as const,
        list: (filters: any) => [...queryKeys.reception.lists(), { filters }] as const,
        details: () => [...queryKeys.reception.all, 'detail'] as const,
        detail: (id: string | number) => [...queryKeys.reception.details(), Number(id)] as const,
    },
    customer: {
        all: ['customers'] as const,
        lists: () => [...queryKeys.customer.all, 'list'] as const,
        list: (filters: any) => [...queryKeys.customer.lists(), { filters }] as const,
        details: () => [...queryKeys.customer.all, 'detail'] as const,
        detail: (id: string | number) => [...queryKeys.customer.details(), Number(id)] as const,
        me: () => [...queryKeys.customer.all, 'me'] as const,
    },
    mechanic: {
        all: ['mechanic'] as const,
        inspect: () => [...queryKeys.mechanic.all, 'inspect'] as const,
        jobs: () => [...queryKeys.mechanic.all, 'jobs'] as const,
        stats: () => [...queryKeys.mechanic.all, 'stats'] as const,
        available: () => [...queryKeys.mechanic.all, 'available'] as const,
        assigned: () => [...queryKeys.mechanic.all, 'assigned'] as const,
        job: (id: string | number) => [...queryKeys.mechanic.all, 'job', Number(id)] as const,
    },
    sale: {
        all: ['sale'] as const,
        stats: () => [...queryKeys.sale.all, 'stats'] as const,
    },
    report: {
        all: ['reports'] as const,
        revenue: (filters: any) => [...queryKeys.report.all, 'revenue', { filters }] as const,
        performance: (filters: any) => [...queryKeys.report.all, 'performance', { filters }] as const,
        inventory: () => [...queryKeys.report.all, 'inventory'] as const,
    },
    finance: {
        all: ['finance'] as const,
        transactions: {
            all: () => [...queryKeys.finance.all, 'transactions'] as const,
            lists: () => [...queryKeys.finance.transactions.all(), 'list'] as const,
            list: (filters: any) => [...queryKeys.finance.transactions.lists(), { filters }] as const,
            details: () => [...queryKeys.finance.transactions.all(), 'detail'] as const,
            detail: (id: string | number) => [...queryKeys.finance.transactions.details(), Number(id)] as const,
            stats: () => [...queryKeys.finance.transactions.all(), 'stats'] as const,
        },
        debts: {
            all: () => [...queryKeys.finance.all, 'debts'] as const,
            lists: () => [...queryKeys.finance.debts.all(), 'list'] as const,
            list: (filters: any) => [...queryKeys.finance.debts.lists(), { filters }] as const,
        }
    },
    identity: {
        all: ['identity'] as const,
        users: {
            all: () => [...queryKeys.identity.all, 'users'] as const,
            lists: (scope: string = 'all') => [...queryKeys.identity.users.all(), 'list', { scope }] as const,
            details: () => [...queryKeys.identity.users.all(), 'detail'] as const,
            detail: (id: string | number) => [...queryKeys.identity.users.details(), Number(id)] as const,
        }
    }
}
;
