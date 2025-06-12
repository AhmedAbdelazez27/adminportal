export class ApiEndpoints {
  static readonly User = {
    Base: '/User',
    GetById: (id: string) => `/User/${id}`,
    Delete: (id: string) => `/User/${id}`
  };
}