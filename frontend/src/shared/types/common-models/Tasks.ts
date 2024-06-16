export interface TemplatesOfTasksType {
    total_pages: number;
    total_count: number;
    has_next_page: boolean;
    payload: Array<{ position: string; tasks: string }>;
}
