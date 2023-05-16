import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../modules/user.js'
import { OAuth2Client } from 'google-auth-library'

const client = new OAuth2Client("299163078742-7udqvrad5p2pc66g2im7q7bknb4pf6gh.apps.googleusercontent.com")


export const getUsers = async (req , res) => {
    try {
        const users = await User.find();
        res.status(200).json(users)
    } catch (error) {
        res.status(404).json({ message: error.message })
    }
}

export const getUserById = async (req , res) => {
    try {
        const userId = req.body.id;
        console.log(req.body);
        const user = await User.findById(userId);
        console.log(user)
        res.json(user);
    } catch (error) {
        res.status(404).json({ message: error.message })
    }
}

export const getChildren = async (req , res) => {
    try {
        const {email} = req.query
        const children = await User.find({parantId: email});
        const offsprings = await User.find({$or: [
            {parantId: email},
            {parantId: children.map(child => child.email)},
            
        ]});
        res.status(200).header('Content-Encoding', 'gzip').send(compress(JSON.stringify(offsprings)));
    } catch (error) {
        res.status(404).json({ message: error.message })
    }
}

export const getGrandchildren = async (req , res) => {
    try {
        const {first, second} = req.query
        const children = await User.find({$or: [
            {parantId: first},
            {parantId: second}
        ]});
        res.status(200).json(children)
    } catch (error) {
        res.status(404).json({ message: error.message })
    }
}

export const googleLogin = async (req , res) => {
    try {
        const { token, parantId } = req.body
        const tickt = await client.verifyIdToken({
            idToken: token,
            audience: "299163078742-7udqvrad5p2pc66g2im7q7bknb4pf6gh.apps.googleusercontent.com",
        })

        const payload = tickt.getPayload();
    
        const { sub, email, name, picture } = payload;
        const user = {name: name, imageUrl: picture, email: email, id: sub, parantId: parantId}
        const existingUser = await User.findOne({ email })
        if(!existingUser) {
            const googleUser =  await User.create(user)
            res.status(200).json({ result: googleUser , token})

        }
        else{
            res.status(200).json({ result: existingUser, token})
        }
    } catch (error) {
        res.status(500).json({ message: "Somthing went wrong."})
    }
    
    
}

export const signin = async (req, res) => {
    const { email, password } = req.body

    try {
        const existingUser = await User.findOne({ email })

        if(!existingUser) {
            return res.status(404).json({ message: "User doesn't exist."})
        }

        const isPasswordCurrect = await bcrypt.compare(password, existingUser.password)

        if(!isPasswordCurrect) {
            return res.status(400).json({ message: "Invalid credentials. please try again"})
        }

        const token = jwt.sign({ email: existingUser.email, id: existingUser._id}, 'test', { expiresIn: "1h" })

        res.status(200).json({ result: existingUser, token})
    } catch (error) {
        res.status(500).json({ message: "Somthing went wrong."})
    }
}

export const signup = async (req, res) => {
    const {email, password, firstName, lastName, confirmPassword, parantId, imageUrl} = req.body

    try {
        const existingUser = await User.findOne({ email })

        if(existingUser) {
            return res.status(400).json({ message: "User already exist."})
        }

        if(password !== confirmPassword){
            return res.status(400).json({ message: "Password don't match."})
        }

        const hashedPassword = await bcrypt.hash(password, 12)

        const result = await User.create({ email, password: hashedPassword, name: `${firstName} ${lastName}`,parantId, imageUrl})

        const token = jwt.sign({ email: result.email, id: result._id}, 'test', { expiresIn: "1h" })

        res.status(200).json({ result: result, token})

    } catch (error) {
        res.status(500).json({ message: "Somthing went wrong."})
    }
}

export const updateUser = async (req, res) => {
    const userId = req.body.id;
    // console.log(userId)

    try {
        const user = await User.findById(userId);
        // console.log(user)
        if (!user) {
            res.status(404).send("User not found");
            return;
        }
    
        if (req.body.name) {
            user.name = req.body.name;
        }
        if (req.body.newEmail) {
            user.email = req.body.newEmail;
        }
        if (req.body.imageUrl) {
            user.imageUrl = req.body.imageUrl;
        }
        const result = await User.updateOne(
            { _id: userId },
            { $set: user });
        
    
        res.status(200).send("User updated successfully");
        } catch (err) {
        // console.error(err);
        res.status(500).send("Internal server error");
    }
}

export const getAllDescendants = async (req, res) => {
    try {
      const { email } = req.query;
      const allDescendants = await findDescendants(email);
      res.status(200).json(allDescendants);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  };
  
  const findDescendants = async (email) => {
    const children = await User.find({ parantId: email });
  
    if (children.length === 0) {
      return [];
    }
  
    let descendants = children;
  
    for (const child of children) {
      const childDescendants = await findDescendants(child.email);
      descendants = descendants.concat(childDescendants);
    }
  
    return descendants;
  };
  