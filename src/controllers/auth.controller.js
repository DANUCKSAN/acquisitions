import logger from '#config/logger.js';
import { signupSchema, signInSchema } from '#validations/auth.validation.js';
import { formatValidationError } from '#utils/format.js';
import { createUser, signIn as signInService } from '#services/auth.service.js';
import { jwttoken } from '#utils/jwt.js';
import { cookies } from '#utils/cookies.js';

export const signup = async (req, res, next) => {
  try {
    const validationResult = signupSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation error',
        details: formatValidationError(validationResult.error),
      });
    }

    const { name, email, role, password } = validationResult.data;

    const user = await createUser({
      name,
      email,
      password,
      role,
    });

    const token = jwttoken.sign({ id: user.id, email: user.email, role: user.role });
    cookies.set(res, 'token', token);

    logger.info(`User registered successfully: ${email}`);

    return res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    logger.error('Signup error', err);

    if (err.message === 'User with this email already exists') {
      return res.status(409).json({ error: 'Email already in use' });
    }

    next(err); // pass to global error handler
  }
};

export const signIn = async (req, res, next) => {
  try {
    const validationResult = signInSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation error',
        details: formatValidationError(validationResult.error),
      });
    }

    const { email, password } = validationResult.data;

    const user = await signInService({ email, password });

    const token = jwttoken.sign({ id: user.id, email: user.email, role: user.role });
    cookies.set(res, 'token', token);

    logger.info(`User signed in successfully: ${email}`);

    return res.status(200).json({
      message: 'Signed in successfully',
      user,
    });
  } catch (err) {
    logger.error('Sign-in error', err);

    if (err.code === 'INVALID_CREDENTIALS' || err.message === 'Invalid email or password') {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    next(err);
  }
};

export const signOut = async (req, res, next) => {
  try {
    cookies.clear(res, 'token');

    logger.info('User signed out', {
      actorId: req.user?.id,
    });

    return res.status(200).json({
      message: 'Signed out successfully',
    });
  } catch (err) {
    logger.error('Sign-out error', err);
    next(err);
  }
};
