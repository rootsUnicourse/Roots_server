import express from 'express'
import {updateInviteLimit, getInviteLimit, fetchUserByEmail,getUserMoneyDetails, addPurchase, getAllDescendants, signin, signup, getUsers, googleLogin, getChildren, getGrandchildren, updateUser, getUserById } from '../controllers/user.js'

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
router.post('/addPurchase', addPurchase);
router.get('/moneyDetails/:id', getUserMoneyDetails);
router.get('/user-by-email',fetchUserByEmail);
router.get('/inviteLimit/:userId', getInviteLimit);
router.put('/updateInviteLimit/:userId', updateInviteLimit);


export default router