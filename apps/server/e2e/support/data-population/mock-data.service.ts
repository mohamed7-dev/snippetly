import { CreateDeveloperDtoType } from '@snippetly/common/dto';
import faker from 'faker';

export class MockDataService {
    constructor() {
        // make the generated results deterministic
        faker.seed(1);
    }
    static getMockDevelopers(count: number): Array<CreateDeveloperDtoType['input']> {
        faker.seed(1);
        const results: Array<CreateDeveloperDtoType['input']> = [];

        for (let i = 0; i < count; i++) {
            const firstName = faker.name.firstName();
            const lastName = faker.name.lastName();
            const developer: CreateDeveloperDtoType['input'] = {
                firstName,
                lastName,
                emailAddress: faker.internet.email(firstName, lastName),
            };
            results.push(developer);
        }
        return results;
    }
}
