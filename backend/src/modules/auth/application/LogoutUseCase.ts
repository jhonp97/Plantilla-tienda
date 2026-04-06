export interface LogoutResult {
  message: string;
}

export class LogoutUseCase {
  execute(): LogoutResult {
    return {
      message: 'Logged out successfully',
    };
  }
}
