const User = require('../models/userModel');
const s3Module = require('../database/s3Connection');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const axios = require('axios');

const s3 = s3Module.s3;
const bucketName = s3Module.bucketName;
const secretKey = process.env.JWT_SECRET_KEY;
const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const redirectUri = 'https://triptimer.website/api/user/auth/google/callback';

class UserController {
    async createUser(userData, avatarFile){
        const existedUser = await User.findOne({
            where: { email: userData.email },
            raw: true,
        })
        if(!existedUser){
            let avatarName = null;
            if(avatarFile){
                avatarName = this.randomImageName();
                await this.sendAvatarToS3(avatarFile, avatarName);
            }
            const hashedPassword = await this.hashPassword(userData.password);
            userData.avatar = avatarName;
            userData.password = hashedPassword;
            const newUser = await User.create(userData);
            return newUser
        }
        else{
            throw new Error('Email already registered');
        }
    }

    async findOrCreateGoogleUser(userData){
        const existedUser = await User.findOne({
            where: { email: userData.email },
            raw: true
        })
        if(!existedUser){
            const newUser = await User.create(userData);
            return newUser
        } else {
            return existedUser
        }
    }

    async checkSignIn(userData){
        try {
            const user = await User.findOne({
                where: { email: userData.email },
                raw: true,
            })
            if(user){
                const isPasswordCorrect = await bcrypt.compare(userData.password, user.password);
                if(isPasswordCorrect){
                    const token = this.createToken(user);
                    return token
                } else {
                    throw new Error('Password incorrect');
                }
            } else {
                throw new Error('Email not registered');
            }
        } catch (error) {
            throw error;
        }
    }

    checkToken(token){
        try {
            const decodedUserData = jwt.verify(token, secretKey);
            return decodedUserData
        } catch (error) {
            throw new Error('Token verification failed');
        }
    }

    createToken(user){
        const expiresInDays = 7;
        const expiresIn = expiresInDays * 24 * 60 * 60;
        const accessToken = jwt.sign(user, secretKey, { expiresIn });
        return accessToken
    }

    getGoogleConsentUrl(){
        try{
            const oauth2Client = new OAuth2Client(clientId, clientSecret, redirectUri);
            const consentUrl = oauth2Client.generateAuthUrl({
                access_type: 'offline',
                scope: 'https://www.googleapis.com/auth/userinfo.profile'
            });
            return consentUrl
        } catch (error) {
            throw error
        }    
    }

    async getAccessToken(authCode){
        const tokenEndpoint = "https://oauth2.googleapis.com/token";
        const payload = {
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: redirectUri,
            code: authCode,
            grant_type: "authorization_code"
        };
        try {
            const response = await axios.post(tokenEndpoint, payload);
            return response.data.access_token;
        } catch (error) {
            console.error("Error fetching access token:", error.response.data);
            throw error;
        }
    }

    async getUserProfile(accessToken){
        const profileEndpoint = "https://www.googleapis.com/oauth2/v3/userinfo";
        const headers = {
            Authorization: `Bearer ${accessToken}`
        };
        try {
            const response = await axios.get(profileEndpoint, { headers });
            return response.data;
        } catch (error) {
            console.error("Error fetching user profile:", error.response.data);
            throw error;
        }
    }

    async sendAvatarToS3(avatarFile, avatarName){
        const params = {
            Bucket: bucketName,
            Key: avatarName,
            Body: avatarFile.buffer,
            ContentType: avatarFile.mimetype
        }
        const command = new PutObjectCommand(params);
        await s3.send(command)
    }

    randomImageName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex')

    async hashPassword(password){
        try {
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            return hashedPassword;
        } catch (error) {
            throw new Error('Password hashing failed');
        }
    }

}

const userController = new UserController();

module.exports = userController;