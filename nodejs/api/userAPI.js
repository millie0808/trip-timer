const express = require('express');
const multer  = require('multer');
const userAPI = express.Router();

const userController = require('../controllers/userController');

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

// 註冊
userAPI.post('/api/user', upload.single('avatar'), async (req, res) => {
    try{
        const userData = req.body;
        const avatarFile = req.file;
        const newUser = await userController.createUser(userData, avatarFile);
        res.status(201).json({
            ok: true
        });
    }
    catch(error){
        console.error('Error creating user:', error);
        if(error.message == 'Email already registered'){
            res.status(400).json({
                error: error
            });
        } else {
            res.status(500).json({
                error: 'Internal Server Error'
            });
        }
    }
})

// 登入
userAPI.post('/api/user/auth', async (req, res) => {
    try{
        const userData = req.body;
        const token = await userController.checkSignIn(userData);
        res.status(201).json({
            ok: true,
            token: token
        });
    } catch (error) {
        if(error.message == 'Email not registered'){
            res.status(404).json({
                error: error
            });
        } else if (error.message == 'Password incorrect') {
            res.status(401).json({
                error: error
            });
        } else {
            console.error('Error checking user:', error);
            res.status(500).json({
                error: 'Internal Server Error'
            });
        }
    }
})

// 驗證
userAPI.get('/api/user/auth', async (req, res) => {
    try {
        // Google
        if(req.session.userProfile){
            const user = req.session.userProfile;
            res.status(200).json({
                ok: true,
                user: user
            })
        } else {
            // app
            const authorizationHeader = req.header('Authorization');
            if (authorizationHeader && authorizationHeader.startsWith('Bearer ')) {
                const token = authorizationHeader.split(' ')[1];
                const user = userController.checkToken(token);
                res.status(200).json({
                    ok: true,
                    user: user
                })
            } else {
                throw new Error('Headers format wrong');
            }
        }
    } catch (error) {
        if(error.message == 'Headers format wrong'){
            res.status(400).json({
                error: error
            });
        } else if (error.message == 'Token verification failed') {
            res.status(401).json({
                error: error
            });
        } else {
            console.error('Error checking user:', error);
            res.status(500).json({
                error: 'Internal Server Error'
            });
        }
    }
})

userAPI.get('/api/user/auth/google', async (req, res) => {
    try{
        const consentUrl = userController.getGoogleConsentUrl();
        res.status(200).json({
            ok: true,
            url: consentUrl
        })
    } catch (error) {
        console.error('Error getting google consent url:', error);
        res.status(500).json({
            error: 'Internal Server Error'
        });
    }
})

userAPI.get('/api/user/auth/google/callback', async (req, res) => {
    try{
        const authorizationCode = req.query.code;
        const accessToken = await userController.getAccessToken(authorizationCode);
        const userProfile = await userController.getUserProfile(accessToken);
        const userData = {
            name: userProfile.name,
            avatar: userProfile.picture,
            email: userProfile.sub
        };
        const user = await userController.findOrCreateGoogleUser(userData);
        req.session.userProfile = user;
        res.redirect('/');
    } catch (error) {
        console.error('Error', error);
        res.status(500).json({
            error: 'Internal Server Error'
        });
    }
})

userAPI.delete('/api/user/auth/google/out', async (req, res) => {
    try{
        delete req.session.userProfile; 
        res.status(200).json({
            ok: true
        })
    } catch (error) {
        console.error('Error deleting session userProfile', error);
        res.status(500).json({
            error: 'Internal Server Error'
        });
    }
})


module.exports = userAPI;