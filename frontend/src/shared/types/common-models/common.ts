export interface CommonType {
    id: string | number;
    name: string;
}

export interface PathParamsDefaultType {
    page?: number;
    itemsPerPage?: number;
    sortBy?: string;
    sortDesk?: boolean;
    search?: string;
}
