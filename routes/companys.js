import express from 'express';
import { getCompanys, createCompany, getCompanyBySearch } from '../controllers/company.js'

const router = express.Router();

router.get('/', getCompanys)
router.post('/', createCompany)
router.get('/search', getCompanyBySearch)


export default router