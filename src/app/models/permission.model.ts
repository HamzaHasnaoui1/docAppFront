export interface Permission {
    id: number;
    name: string;
    description: string;
    category: string;
}

export interface Role {
    roleId: number;
    roleName: string;
    description: string;
    permissions: Permission[];
} 