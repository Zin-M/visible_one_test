import { Router } from 'express';
import { createUser, getUsers, updateRole, deleteUser } from '../controllers/user_controller';
import { requireRole } from '../middlewares/role';
import { validateRequest } from '../middlewares/validateRequest';
import { createUserSchema, changeRoleSchema } from '../validators/user';

const router = Router();

// Publicly accessible so frontend Login simulation can construct options but we don't need this anymore since we have real auth, however I will keep it open so it works with the old UI before fixing frontend
router.get('/', getUsers);

import { requireAuth } from '../middlewares/auth';

// Enforce identity and administrator constraints dynamically downstream
router.use(requireAuth, requireRole('admin'));

router.post('/', validateRequest(createUserSchema), createUser);
router.patch('/:id/role', validateRequest(changeRoleSchema), updateRole);
router.delete('/:id', deleteUser);

export default router;
