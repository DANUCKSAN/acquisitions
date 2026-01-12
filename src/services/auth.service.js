import logger from '#config/logger.js';
import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { db } from '#config/database.js';
import { users } from '#models/user.model.js';

export const hashPassword = async (password) => {
  try {
    return await bcrypt.hash(password, 10);
  } catch (err) {
    logger.error(`Error hashing password : ${err}`);
    throw new Error('Failed to hash password');
  }
};

export const createUser = async ({ name, email, password, role = 'user' }) => {
  try {
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) throw new Error('User with this email already exists');

    const hashedPassword = await hashPassword(password);
    const [newUser] = await db
      .insert(users)
      .values({ name, email, password: hashedPassword, role })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
      });
    logger.info(`User created successfully: ${email}`);
    return newUser;
  } catch (err) {
    logger.error(`Error creating user : ${err}`);
    throw new Error('Failed to create user');
  }
};

export const signIn = async ({ email, password }) => {
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      const error = new Error('Invalid email or password');
      error.code = 'INVALID_CREDENTIALS';
      throw error;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const error = new Error('Invalid email or password');
      error.code = 'INVALID_CREDENTIALS';
      throw error;
    }

    const { password: _password, ...userWithoutPassword } = user;
    logger.info(`User signed in successfully: ${email}`);
    return userWithoutPassword;
  } catch (err) {
    if (err.code === 'INVALID_CREDENTIALS') {
      throw err;
    }

    logger.error(`Error signing in user : ${err}`);
    throw new Error('Failed to sign in');
  }
};
