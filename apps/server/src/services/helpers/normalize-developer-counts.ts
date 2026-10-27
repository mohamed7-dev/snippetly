export interface DeveloperCount {
    developerId: string;
    count: number;
}

export function normalizeDeveloperCounts(
    developerIds: string[],
    counts: Array<{ developerId: string; count: number | string }>,
): DeveloperCount[] {
    const countsByDeveloperId = new Map(
        counts.map(({ developerId, count }) => [developerId, Number(count)]),
    );

    return developerIds.map(developerId => ({
        developerId,
        count: countsByDeveloperId.get(developerId) ?? 0,
    }));
}
