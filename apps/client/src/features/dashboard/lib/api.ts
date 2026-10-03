import { queryOptions } from '@tanstack/react-query';

export const getCurrentUserDashboardOptions = queryOptions({
    queryKey: ['users', 'current', 'dashboard'],
    queryFn: async () => {
        const res = await api.get<GetCurrentUserDashboardResDtoType['success']>(
            serverEndpoints.getCurrentUserDashboard,
        );
        return res.data;
    },
});
