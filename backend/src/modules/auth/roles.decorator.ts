import { SetMetadata } from '@nestjs/common';

// decorator for roles guard metadata
export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
