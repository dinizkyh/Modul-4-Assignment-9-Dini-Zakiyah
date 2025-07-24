import { RepositoryFactory } from '@/repositories';
import { JWTUtils, PasswordUtils, EmailUtils } from '@/utils';
import { 
  User, 
  RegisterUserDto, 
  LoginUserDto, 
  AuthenticationError, 
  ConflictError, 
  ValidationError 
} from '@/types';

/**
 * User service handling authentication and user management business logic
 */
export class UserService {
  private userRepository = RepositoryFactory.getUserRepository();

  /**
   * Register a new user
   * @param userData User registration data
   * @returns Promise<{ user: User, token: string }> Created user and JWT token
   */
  async register(userData: RegisterUserDto): Promise<{ user: User, token: string }> {
    // Validate email format
    if (!EmailUtils.isValidEmail(userData.email)) {
      throw new ValidationError('Invalid email format');
    }

    // Validate password strength
    if (!PasswordUtils.validatePasswordStrength(userData.password)) {
      throw new ValidationError(
        'Password must be at least 8 characters long and contain at least one letter and one number'
      );
    }

    // Normalize email
    const normalizedEmail = EmailUtils.normalizeEmail(userData.email);

    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(normalizedEmail);
    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await PasswordUtils.hashPassword(userData.password);

    // Create user
    const user = await this.userRepository.create({
      email: normalizedEmail,
      password: hashedPassword,
    });

    // Generate JWT token
    const token = await JWTUtils.generateToken({
      userId: user.id,
      email: user.email,
    });

    // Return user without password
    const userWithoutPassword = this.sanitizeUser(user);

    return {
      user: userWithoutPassword,
      token,
    };
  }

  /**
   * Authenticate user login
   * @param credentials User login credentials
   * @returns Promise<{ user: User, token: string }> Authenticated user and JWT token
   */
  async login(credentials: LoginUserDto): Promise<{ user: User, token: string }> {
    // Validate email format
    if (!EmailUtils.isValidEmail(credentials.email)) {
      throw new ValidationError('Invalid email format');
    }

    // Normalize email
    const normalizedEmail = EmailUtils.normalizeEmail(credentials.email);

    // Find user by email
    const user = await this.userRepository.findByEmail(normalizedEmail);
    if (!user) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await PasswordUtils.verifyPassword(
      credentials.password,
      user.password
    );

    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Generate JWT token
    const token = await JWTUtils.generateToken({
      userId: user.id,
      email: user.email,
    });

    // Return user without password
    const userWithoutPassword = this.sanitizeUser(user);

    return {
      user: userWithoutPassword,
      token,
    };
  }

  /**
   * Get user by ID
   * @param userId User ID
   * @returns Promise<User | null> User without password or null if not found
   */
  async getUserById(userId: string): Promise<User | null> {
    const user = await this.userRepository.findById(userId);
    return user ? this.sanitizeUser(user) : null;
  }

  /**
   * Get user by email
   * @param email User email
   * @returns Promise<User | null> User without password or null if not found
   */
  async getUserByEmail(email: string): Promise<User | null> {
    const normalizedEmail = EmailUtils.normalizeEmail(email);
    const user = await this.userRepository.findByEmail(normalizedEmail);
    return user ? this.sanitizeUser(user) : null;
  }

  /**
   * Update user password
   * @param userId User ID
   * @param currentPassword Current password for verification
   * @param newPassword New password
   * @returns Promise<User> Updated user without password
   */
  async updatePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<User> {
    // Find user
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AuthenticationError('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await PasswordUtils.verifyPassword(
      currentPassword,
      user.password
    );

    if (!isCurrentPasswordValid) {
      throw new AuthenticationError('Current password is incorrect');
    }

    // Validate new password strength
    if (!PasswordUtils.validatePasswordStrength(newPassword)) {
      throw new ValidationError(
        'New password must be at least 8 characters long and contain at least one letter and one number'
      );
    }

    // Hash new password
    const hashedNewPassword = await PasswordUtils.hashPassword(newPassword);

    // Update user
    const updatedUser = await this.userRepository.update(userId, {
      password: hashedNewPassword,
    });

    if (!updatedUser) {
      throw new Error('Failed to update password');
    }

    return this.sanitizeUser(updatedUser);
  }

  /**
   * Delete user account
   * @param userId User ID
   * @param password Password for verification
   * @returns Promise<boolean> True if deleted successfully
   */
  async deleteUser(userId: string, password: string): Promise<boolean> {
    // Find user
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AuthenticationError('User not found');
    }

    // Verify password
    const isPasswordValid = await PasswordUtils.verifyPassword(password, user.password);
    if (!isPasswordValid) {
      throw new AuthenticationError('Password is incorrect');
    }

    // Delete user (this should cascade delete all user's lists and tasks)
    return await this.userRepository.delete(userId);
  }

  /**
   * Remove password from user object for safe API responses
   * @param user User object with password
   * @returns User User object without password
   */
  private sanitizeUser(user: User): User {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  }
}
