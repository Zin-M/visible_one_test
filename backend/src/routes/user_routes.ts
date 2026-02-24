import { Router } from 'express';
import { createUser, getUsers, updateRole, deleteUser } from '../controllers/user_controller';
import { requireRole } from '../middlewares/role';
import { requireAuth } from '../middlewares/auth';
import { validateRequest } from '../middlewares/validateRequest';
import { createUserSchema, changeRoleSchema } from '../validators/user';

const router = Router();


router.use(requireAuth);



router.get('/', requireRole('admin', 'owner', 'user'), getUsers);

router.post('/', requireRole('admin'), validateRequest(createUserSchema), createUser);
router.patch('/:id/role', requireRole('admin'), validateRequest(changeRoleSchema), updateRole);
router.delete('/:id', requireRole('admin'), deleteUser);

export default router;
