import logger from '#config/logger.js';
import { db } from '#config/database.js';
import { users } from '#models/user.model.js';
import { eq } from 'drizzle-orm';

// Return a list of all users (without password hashes)
export const getAllUsers = async () => {
  try {
    const result = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users);

    logger.info(`Fetched ${result.length} users`);
    return result;
  } catch (err) {
    logger.error('Error fetching all users', err);
    throw new Error('Failed to fetch users');
  }
};

// Retrieve a single user by id
export const getUserById = async (id) => {
  const numericId = Number(id);

  try {
    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.id, numericId))
      .limit(1);

    if (!user) {
      const error = new Error('User not found');
      error.code = 'USER_NOT_FOUND';
      throw error;
    }

    logger.info(`Fetched user by id: ${numericId}`);
    return user;
  } catch (err) {
    if (err.code === 'USER_NOT_FOUND') {
      // Domain error, just rethrow
      throw err;
    }

    logger.error(`Error fetching user with id ${numericId}`, err);
    throw new Error('Failed to fetch user');
  }
};

// Update an existing user
export const updateUser = async (id, updates) => {
  const numericId = Number(id);

  try {
    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, numericId))
      .limit(1);

    if (!existing) {
      const error = new Error('User not found');
      error.code = 'USER_NOT_FOUND';
      throw error;
    }

    const updateData = {};

    if (typeof updates.name === 'string') {
      updateData.name = updates.name;
    }
    if (typeof updates.email === 'string') {
      updateData.email = updates.email;
    }
    if (typeof updates.role === 'string') {
      updateData.role = updates.role;
    }

    if (Object.keys(updateData).length === 0) {
      // Nothing to update, return existing user snapshot
      const existingUser = await getUserById(numericId);
      return existingUser;
    }

    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, numericId))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      });

    logger.info(`Updated user with id ${numericId}`);
    return updatedUser;
  } catch (err) {
    if (err.code === 'USER_NOT_FOUND') {
      throw err;
    }

    logger.error(`Error updating user with id ${numericId}`, err);
    throw new Error('Failed to update user');
  }
};

// Delete a user by id
export const deleteUser = async (id) => {
  const numericId = Number(id);

  try {
    const [deleted] = await db
      .delete(users)
      .where(eq(users.id, numericId))
      .returning({ id: users.id });

    if (!deleted) {
      const error = new Error('User not found');
      error.code = 'USER_NOT_FOUND';
      throw error;
    }

    logger.info(`Deleted user with id ${numericId}`);
    return deleted.id;
  } catch (err) {
    if (err.code === 'USER_NOT_FOUND') {
      throw err;
    }

    logger.error(`Error deleting user with id ${numericId}`, err);
    throw new Error('Failed to delete user');
  }
};
