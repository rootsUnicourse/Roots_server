import express from 'express'
import { signin, signup, getUsers, googleLogin, getChildren, getGrandchildren, updateUser, getUserById } from '../controllers/user.js'

const router = express.Router()

router.post('/signin', signin)
router.post('/signup', signup)
router.get('/', getUsers)
router.get('/children', getChildren)
router.get('/grandchildren' ,getGrandchildren)
router.post('/googleLogin', googleLogin)
router.put('/update', updateUser)
router.get('/byid', getUserById)



export default router