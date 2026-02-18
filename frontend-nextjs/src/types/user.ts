/**
 * User type for admin user list/edit (from GET /api/users)
 */
export interface UserRoleRef {
  _id: string;
  name: string;
  slug: string;
}

export interface DepartmentRef {
  _id: string;
  title?: string;
}

export interface PositionRef {
  _id: string;
  title?: string;
}

export interface AdminUser {
  _id: string;
  username: string;
  email: string;
  role?: UserRoleRef | null;
  department?: DepartmentRef | string | null;
  position?: PositionRef | string | null;
  image?: string;
  active?: boolean;
}
