export interface ApiError {
  status?: string;   // "Business Error!"
  code?: number;     // 400
  reason?: string;   
  note?: string;     
}