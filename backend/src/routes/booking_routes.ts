import { Router } from 'express';
import { createBooking, getBookings, deleteBooking, getGroupedBookings, getBookingSummary } from '../controllers/booking_controller';
import { requireRole } from '../middlewares/role';
import { validateRequest } from '../middlewares/validateRequest';
import { createBookingSchema } from '../validators/booking';
import { requireAuth } from '../middlewares/auth';

const router = Router();

router.use(requireAuth);

// Owner / Admin specfic routes (must come before dynamic ID routes if any GET/:id existed)
router.get('/grouped', requireRole('owner', 'admin'), getGroupedBookings);
router.get('/summary', requireRole('owner', 'admin'), getBookingSummary);

// Routes accessible by all users (user, owner, admin)
router.post('/', validateRequest(createBookingSchema), requireRole('user', 'owner', 'admin'), createBooking);
router.get('/', requireRole('user', 'owner', 'admin'), getBookings);

// Delete - specific user checks happen inside the controller layer
// (Users can only delete their own. Admin/Owner can delete any)
router.delete('/:id', requireRole('user', 'owner', 'admin'), deleteBooking);

export default router;
