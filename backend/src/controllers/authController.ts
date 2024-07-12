import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { JwtPayload } from 'jsonwebtoken';
import User from '../models/userModel';

export const register = async (req: Request, res: Response) => {
    const { email, password, name } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(401).send({ error: 'User already exists' });
        }
        const user = new User({ email, password, name });
        await user.save();
        res.status(201).send('User registered');
    } catch (error) {
        res.status(400).send(error);
    }
};

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).send({ error: 'Invalid credentials' });
        }
        if (!user.password) {
            return res.status(401).send({ error: 'Invalid credentials' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).send({ error: 'Invalid credentials' });
        }
        const token = jwt.sign(
            { _id: user._id },
            process.env.JWT_SECRET ?? 'defaultSecret',
            { expiresIn: '30d' }
        );
        res.status(200).json({ token, email: user.email, name: user.name });
    } catch (error) {
        res.status(500).send({ error: 'Server error' });
    }
};

export const verifyjwt = async (req: Request, res: Response) => {
    try {
        let token = req.headers.authorization;
        if (!token) {
            return res.status(401).json({ error: 'Access Denied / Unauthorized request' });
        }
        token = token.split(' ')[1];
        if (token === 'null' || !token) {
            return res.status(401).json({ error: 'Access Denied / Unauthorized request' });
        }
        const verified = jwt.verify(token, process.env.JWT_SECRET ?? 'defaultSecret');

        // Use type assertion to narrow down the type
        const payload = verified as JwtPayload;

        if (!payload) {
            return res.status(401).json({ error: 'Access Denied / Unauthorized request' });
        }

        const user = await User.findById(payload._id);
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }
        return res.status(200).json({ email: user.email, name: user.name });
    } catch (error) {
        res.status(401).json({ error: 'Please authenticate' });
    }
};
