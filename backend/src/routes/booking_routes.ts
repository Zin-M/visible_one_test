import { Router } from 'express';
import { createBooking, getBookings, deleteBooking, getGroupedBookings, getBookingSummary } from '../controllers/booking_controller';
import { requireRole } from '../middlewares/role';
import { validateRequest } from '../middlewares/validateRequest';
import { createBookingSchema } from '../validators/booking';
import { requireAuth } from '../middlewares/auth';

const router = Router();

router.use(requireAuth);


router.get('/grouped', requireRole('owner', 'admin'), getGroupedBookings);
router.get('/summary', requireRole('owner', 'admin'), getBookingSummary);


router.post('/', validateRequest(createBookingSchema), requireRole('user', 'owner', 'admin'), createBooking);
router.get('/', requireRole('user', 'owner', 'admin'), getBookings);



router.delete('/:id', requireRole('user', 'owner', 'admin'), deleteBooking);

export default router;
