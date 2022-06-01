import GoogleUser from '../modules/googleUser'
import { OAuth2Client } from 'google-auth-library'

const client = new OAuth2Client("299163078742-7udqvrad5p2pc66g2im7q7bknb4pf6gh.apps.googleusercontent.com")

export const getUsers = async (req , res) => {
    try {
        const users = await GoogleUser.find();
        res.status(200).json(users)
    } catch (error) {
        res.status(404).json({ message: error.message })
    }
}

export googleLogin = async (req , res) => {
    const { token } = req.body
    const tickt = await client.verifyIdToken({
        idToken: token,
        audience: "299163078742-7udqvrad5p2pc66g2im7q7bknb4pf6gh.apps.googleusercontent.com",
    })

    const payload = tickt.getPayload();
    console.log('payload:', payload)
}