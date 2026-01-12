import logger from '#config/logger.js';
import { formatValidationError } from '#utils/format.js';
import { userIdSchema, updateUserSchema } from '#validations/users.validation.js';
import {
  getAllUsers as getAllUsersService,
  getUserById as getUserByIdService,
  updateUser as updateUserService,
  deleteUser as deleteUserService,
} from '#services/users.service.js';

// GET /api/users
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await getAllUsersService();
    logger.info('Fetched all users', {
      count: users.length,
      actorId: req.user?.id,
    });

    return res.status(200).json({ users });
  } catch (err) {
    logger.error('Error fetching all users', err);
    next(err);
  }
};

// GET /api/users/:id
export const getUserById = async (req, res, next) => {
  try {
    const validationResult = userIdSchema.safeParse(req.params);

    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation error',
        details: formatValidationError(validationResult.error),
      });
    }

    const { id } = validationResult.data;

    const user = await getUserByIdService(id);

    logger.info('User fetched by id', {
      userId: id,
      actorId: req.user?.id,
    });

    return res.status(200).json({ user });
  } catch (err) {
    logger.error('Error fetching user by id', err);

    if (err.code === 'USER_NOT_FOUND' || err.message === 'User not found') {
      return res.status(404).json({ error: 'User not found' });
    }

    next(err);
  }
};

// PATCH /api/users/:id
export const updateUser = async (req, res, next) => {
  try {
    // Validate id
    const idValidation = userIdSchema.safeParse(req.params);
    if (!idValidation.success) {
      return res.status(400).json({
        error: 'Validation error',
        details: formatValidationError(idValidation.error),
      });
    }

    const { id } = idValidation.data;

    // Validate body
    const bodyValidation = updateUserSchema.safeParse(req.body);
    if (!bodyValidation.success) {
      return res.status(400).json({
        error: 'Validation error',
        details: formatValidationError(bodyValidation.error),
      });
    }

    const updates = bodyValidation.data;

    // Authorization: user can update only themselves; admin can update anyone
    const actor = req.user;

    if (!actor) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const isSelf = Number(actor.id) === Number(id);
    const isAdmin = actor.role === 'admin';

    if (!isSelf && !isAdmin) {
      return res
        .status(403)
        .json({ error: 'You are not allowed to update this user' });
    }

    // Only admins can change role
    if (typeof updates.role !== 'undefined' && !isAdmin) {
      return res
        .status(403)
        .json({ error: 'Only admin users can change user roles' });
    }

    const updatedUser = await updateUserService(id, updates);

    logger.info('User updated', {
      userId: id,
      actorId: actor.id,
      fields: Object.keys(updates),
    });

    return res.status(200).json({
      message: 'User updated successfully',
      user: updatedUser,
    });
  } catch (err) {
    logger.error('Error updating user', err);

    if (err.code === 'USER_NOT_FOUND' || err.message === 'User not found') {
      return res.status(404).json({ error: 'User not found' });
    }

    next(err);
  }
};

// DELETE /api/users/:id
export const deleteUser = async (req, res, next) => {
  try {
    const idValidation = userIdSchema.safeParse(req.params);
    if (!idValidation.success) {
      return res.status(400).json({
        error: 'Validation error',
        details: formatValidationError(idValidation.error),
      });
    }

    const { id } = idValidation.data;

    const actor = req.user;

    if (!actor) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const isSelf = Number(actor.id) === Number(id);
    const isAdmin = actor.role === 'admin';

    if (!isSelf && !isAdmin) {
      return res
        .status(403)
        .json({ error: 'You are not allowed to delete this user' });
    }

    const deletedId = await deleteUserService(id);

    logger.info('User deleted', {
      userId: deletedId,
      actorId: actor.id,
    });

    return res.status(200).json({
      message: 'User deleted successfully',
      userId: deletedId,
    });
  } catch (err) {
    logger.error('Error deleting user', err);

    if (err.code === 'USER_NOT_FOUND' || err.message === 'User not found') {
      return res.status(404).json({ error: 'User not found' });
    }

    next(err);
  }
};
