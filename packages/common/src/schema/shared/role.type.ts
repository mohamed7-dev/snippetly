import z from 'zod';
import { node } from './common-schemas.js';
import { permissionEnum } from './generated-permission.js';

export const role = node.extend({
    name: z.string().nonempty(),
    description: z.string().nonempty(),
    permissions: z.array(permissionEnum).nonempty(),
});
