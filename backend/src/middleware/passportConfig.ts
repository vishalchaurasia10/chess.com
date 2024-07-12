import passport from 'passport';
import { Strategy as GoogleStrategy, Profile } from 'passport-google-oauth20';
import { Request, Response } from 'express';
import User, { IUser } from '../models/userModel';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

// Generate JWT Token
function generateJwtToken(user: IUser): string {
    const accessToken = jwt.sign(
        { _id: user._id },
        process.env.JWT_SECRET as string,
        { expiresIn: '30d' }
    );
    return accessToken;
}

// Initialize the Google OAuth strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID as string,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    callbackURL: process.env.GOOGLE_CALLBACK_URL as string
}, async (accessToken: string, refreshToken: string, profile: Profile, done: (error: any, user?: any) => void) => {
    try {
        // Check if a user with this Google ID already exists
        let user = await User.findOne({ email: profile.emails?.[0].value });

        if (!user) {
            // If the user doesn't exist, create a new user
            user = new User({
                email: profile.emails?.[0].value,
                name: profile.displayName,
                isVerified: true
            });

            user = await user.save();
        }

        // Create a JWT token
        const token = generateJwtToken(user);

        return done(null, token);
    } catch (error) {
        return done(error, false);
    }
}));

// Serialize the user to store in the session
passport.serializeUser((user: any, done: (err: any, id?: any) => void) => {
    done(null, user.id);
});

// Deserialize the user from the session
passport.deserializeUser(async (id: string, done: (err: any, user?: any) => void) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

// Create a route for Google OAuth authentication
export const googleAuth = passport.authenticate('google', {
    scope: ['profile', 'email'], // Define the scopes you need
});

// Handle the Google OAuth callback
export const googleAuthCallback = (req: Request, res: Response) => {
    passport.authenticate('google', (err: any, token: string) => {
        if (err) {
            // Handle the error, e.g., redirect to an error page
            return res.redirect(`${process.env.FRONTEND_URL}/auth-error`);
        }

        if (token) {
            // Append the token as a query parameter to the successRedirect URL
            const redirectUrl = `${process.env.FRONTEND_URL}/verification?token=${token}`;
            return res.redirect(redirectUrl);
        }

        // Handle any other case, e.g., redirect to a login page
        return res.redirect(`${process.env.FRONTEND_URL}/login`);
    })(req, res);
};
