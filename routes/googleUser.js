import express from 'express'
import { signin, signup, getUsers } from '../controllers/googleUser.js'

const router = express.Router()

router.post('/signin', signin)
router.post('/signup', signup)
router.get('/',getUsers)


export default router