import express from 'express'
import {getAllDescendants, signin, signup, getUsers, googleLogin, getChildren, getGrandchildren, updateUser, getUserById } from '../controllers/user.js'

const router = express.Router()

router.post('/signin', signin)
router.post('/signup', signup)
router.get('/', getUsers)
router.get('/children', getChildren)
router.get('/grandchildren' ,getGrandchildren)
router.post('/googleLogin', googleLogin)
router.put('/update', updateUser)
router.get('/byid', getUserById)
router.get('/descendants', getAllDescendants);


export default router