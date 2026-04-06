import type { IUserRepository } from '@modules/auth/domain/IUserRepository';
import type { User } from '@modules/auth/domain/User';

export class GetCurrentUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(userId: string): Promise<ReturnType<User['toPublicJSON']>> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    return user.toPublicJSON();
  }
}
