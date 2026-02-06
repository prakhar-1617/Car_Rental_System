const express = require('express');
const { getCars, getCarById, createCar, updateCar, deleteCar } = require('../controllers/car.controller');
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');
const upload = require('../middleware/upload');
const validate = require('../middleware/validate');
const { createCarSchema, updateCarSchema } = require('../validations/car.schema');

const router = express.Router();

router.get('/', getCars);
router.get('/:id', getCarById);

// Admin Routes
router.post('/', protect, admin, upload.single('image'), validate(createCarSchema), createCar);
router.put('/:id', protect, admin, upload.single('image'), validate(updateCarSchema), updateCar);
router.delete('/:id', protect, admin, deleteCar);

module.exports = router;
