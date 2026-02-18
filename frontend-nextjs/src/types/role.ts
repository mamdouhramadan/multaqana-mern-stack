/**
 * Role and permission types for admin Roles & Permissions
 */

export interface Role {
  _id: string;
  name: string;
  slug: string;
  permissions: string[];
  isDefault?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/** Grouped permissions from GET /api/roles/permissions */
export interface PermissionsGrouped {
  resource: string;
  permissions: string[];
}

export type RoleFormPayload = Pick<Role, 'name' | 'slug' | 'permissions' | 'isDefault'>;
