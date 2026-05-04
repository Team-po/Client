export interface ApiErrorResponse {
	code?: string;
	fieldErrors?: Record<string, string>;
	message: string;
}
