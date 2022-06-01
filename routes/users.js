import express from 'express'
import { signin, signup, getUsers, googleLogin } from '../controllers/user.js'

const router = express.Router()

router.post('/signin', signin)
router.post('/signup', signup)
router.get('/',getUsers)
router.post('/googleLogin', googleLogin)

export default router