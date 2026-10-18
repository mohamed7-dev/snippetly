import { developerApiClient } from '@/lib/api-client';
import { apiEndpoints } from '@/lib/api-endpoints';
import { fetchAndCacheDashboardData } from '@/features/offline-snippet/lib/offline-dashboard-cache';
import { getOfflineOwnerId } from '@/features/offline-snippet/lib/store';
import type { ActiveDeveloperAccountStatsDtoType } from '@snippetly/common/dto';
import { queryOptions } from '@tanstack/react-query';

export const getCurrentDeveloperActivityStats = () =>
    queryOptions({
        queryKey: ['stats', 'current', getOfflineOwnerId()],
        queryFn: async () => {
            const url = apiEndpoints.developers.getActiveDeveloperStats.url;
            return fetchAndCacheDashboardData(
                'stats',
                url,
                () =>
                    developerApiClient.fetch<ActiveDeveloperAccountStatsDtoType['output']>(url, {
                        method: apiEndpoints.developers.getActiveDeveloperStats.method,
                    }),
            );
        },
    });
