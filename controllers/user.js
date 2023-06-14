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
        const user = await User.findById(userId);
        res.json(user);
    } catch (error) {
        res.status(404).json({ message: error.message })
    }
}

export const getChildren = async (req , res) => {
    try {
        const {email} = req.query
        const children = await User.find({parentId: email});
        const offsprings = await User.find({$or: [
            {parentId: email},
            {parentId: children.map(child => child.email)},
            
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
            {parentId: first},
            {parentId: second}
        ]});
        res.status(200).json(children)
    } catch (error) {
        res.status(404).json({ message: error.message })
    }
}

export const googleLogin = async (req , res) => {
    try {
        const { token, parentId } = req.body
        const tickt = await client.verifyIdToken({
            idToken: token,
            audience: "299163078742-7udqvrad5p2pc66g2im7q7bknb4pf6gh.apps.googleusercontent.com",
        })

        const payload = tickt.getPayload();
    
        const { sub, email, name, picture } = payload;
        const user = {name: name, imageUrl: picture, email: email, id: sub, parentId: parentId}
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
    const { email, password, firstName, lastName, confirmPassword, parentId, imageUrl } = req.body;

    try {
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ message: "User already exist." });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Password don't match." });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const result = await User.create({
            email,
            password: hashedPassword,
            name: `${firstName} ${lastName}`,
            parentId,
            imageUrl
        });

        // if the parentId exists in the user object then find the parent and add initial earnings to descendantsEarnings
        if (parentId) {
            const parentUser = await User.findOne({ email: parentId });
            if (parentUser) {
                // create a new descendantEarning object and push it into the descendantsEarnings array
                const newDescendantEarning = {
                    descendant: result._id,  // the ID of the newly created user
                    earnings: 0  // replace this with the actual initial earnings value
                };
                parentUser.descendantsEarnings.push(newDescendantEarning);
                await parentUser.save();  // save the parent user after the update
            }
        }

        const token = jwt.sign({ email: result.email, id: result._id }, 'test', { expiresIn: "1h" });

        res.status(200).json({ result, token });
    } catch (error) {
        res.status(500).json({ message: "Something went wrong." });
    }
}



export const updateUser = async (req, res) => {
    const userId = req.body.id;

    try {
        const user = await User.findById(userId);
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
        
        // Save the updated user document
        const updatedUser = await user.save();

        // Return the updated user
        res.status(200).json(updatedUser);
    } catch (err) {
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
        const children = await User.find({ parentId: email });

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

async function fetchAncestorUser(userId) {
    // Fetch the user document for the provided userId
    const user = await User.findById(userId);

    if (!user) {
        throw new Error('User not found');
    }

    // Fetch the parent of this user
    const parentUser = await User.findById(user.parentId);

    if (!parentUser) {
        throw new Error('Parent user not found');
    }

    return parentUser;
}



    export const addPurchase = async (req, res) => {
        try {
            const {userId, totalPurchase} = req.body;
            const user = await User.findById(userId);
            if (!user) throw new Error('User not found');

            const cashback = totalPurchase * 0.1; // 10% cashback
            user.moneyEarned += cashback * 0.5; // 5% goes to the user

            const remainingCashback = cashback * 0.5; // remaining 5%
            let parentId = user.parentId;
            let splitFactor = 0.5;

            while(parentId && splitFactor >= 0.125) {
                const parentUser = await User.findById(parentId);
                if (!parentUser) break;

                const parentCashback = remainingCashback * splitFactor;
                parentUser.moneyEarned += parentCashback;
                await parentUser.save();

                // Update for next iteration
                parentId = parentUser.parentId;
                splitFactor /= 2;
            }



            user.lastActivity = Date.now();
            await user.save();


                // Calculate earnings for the ancestor (this is specific to your business logic)
        let earningsFromThisPurchase = calculateEarnings(purchaseAmount);

        // Fetch the ancestor user - you need to implement this function based on your user hierarchy logic
        let ancestorUser = await fetchAncestorUser(userId);

        // Find the corresponding descendantEarning object for this descendant
        let descendantEarning = ancestorUser.descendantsEarnings.find(de => de.descendant.equals(userId));

        // If this is the first time the descendant is contributing to the earnings,
        // create a new descendantEarning object for them
        if (!descendantEarning) {
            descendantEarning = {
                descendant: userId,
                earnings: 0
            };
            ancestorUser.descendantsEarnings.push(descendantEarning);
        }

        // Increase the earnings from this descendant
        descendantEarning.earnings += earningsFromThisPurchase;

        // Save the ancestorUser document with the updated descendantsEarnings field
        await ancestorUser.save();

            res.status(200).send('Purchase added successfully');
        } catch (error) {
            res.status(500).send(error.message);
        }
    }

    export const getUserMoneyDetails = async (req , res) => {
        try {
            const userId = req.params.id;
            const user = await User.findById(userId);
    
            if (!user) {
                res.status(404).send('User not found');
            } else {
                const data = {
                    name: user.name,
                    email: user.email,
                    moneyEarned: user.moneyEarned,
                    moneyWaiting: user.moneyWaiting,
                    moneyApproved: user.moneyApproved,
                    cashWithdrawn: user.cashWithdrawn,
                    lastActivity: user.lastActivity,
                    createdAt: user.createdAt
                };
                res.send(data);
            }
        } catch (error) {
            res.status(500).send(error.message);
        }
    }
    


    async function fetchTopAncestorUser(userId) {
        let user = await User.findById(userId);
    
        if (!user) {
            throw new Error('User not found');
        }
    
        // Keep fetching the parent until we find a user with no parent
        while (user.parentId) {
            user = await User.findById(user.parentId);
    
            if (!user) {
                throw new Error('Parent user not found');
            }
        }
    
        // The user with no parent is the top ancestor
        return user;
    }
    

    export const fetchUserByEmail = async (req, res) => {
        const { email } = req.query;
        try {
            const user = await User.findOne({ email });
    
            if (!user) {
                return res.status(404).json({ message: "User not found." })
            }
    
            res.status(200).json(user);
        } catch (error) {
            res.status(500).json({ message: "Something went wrong." });
        }
    }
    
    export const getInviteLimit = async (req, res) => {
        try {
            const email = req.params.userId;
            const user = await User.findOne({email});
            res.status(200).json({inviteLimit: user.inviteLimit});
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    
    export const updateInviteLimit = async (req, res) => {
        try {
            const email = req.params.userId;
            const user = await User.findOne({email});
            user.inviteLimit = req.body.inviteLimit;  // Assume the new limit is in the request body
            await user.save();
            res.status(200).json({inviteLimit: user.inviteLimit});
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    