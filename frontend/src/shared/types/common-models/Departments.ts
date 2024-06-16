export interface DepartmentsType {
    total_pages: number;
    total_count: number;
    has_next_page: boolean;
    payload: Array<{ id: string; name: string }>;
}
