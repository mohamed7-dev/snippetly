import { AppEntity } from './app-entity';

/**
 * @description
 * Given an entity and a subset of the entity, it overrides the properties on the
 * the entity.
 */
export function patchEntity<
    Entity extends AppEntity,
    Input extends { [K in keyof Entity]?: Entity[K] | null },
>(entity: Entity, input: Input): Entity {
    for (const [key] of Object.entries(entity)) {
        const value = input[key as keyof Entity];
        if (key !== 'id' && value !== undefined) {
            entity[key as keyof Entity] = value as any;
        }
    }
    return entity;
}
