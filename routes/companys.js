import express from 'express';
import { getCompanyByUrl, getCompanys, createCompany, getCompanyBySearch } from '../controllers/company.js'

const router = express.Router();

router.get('/', getCompanys)
router.post('/', createCompany)
router.get('/search', getCompanyBySearch)
router.post('/companyByUrl', getCompanyByUrl);

export default router