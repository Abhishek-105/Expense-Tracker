const express = require('express');
const { getBudget, setBudget, updateBudget, getBudgetHistory } = require('../controllers/budgetController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/history', getBudgetHistory);
router.get('/', getBudget);
router.post('/', setBudget);
router.put('/:id', updateBudget);

module.exports = router;
