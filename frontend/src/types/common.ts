export type ApiResponse<T> = {
    success: boolean;
    status?: string | null;
    data?: T;
    message?: string;
    errors?: string[];
};

export interface FoundUsers {
    id: string;
    name: string;
}

export interface FoundSkills {
    id: string;
    title: string;
}

export type Found = FoundUsers &
    FoundSkills & {
        name?: string;
        title?: string;
    };
