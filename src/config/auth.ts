const authConfig = {
    secret: process.env.AUTH_SECRET_TOKEN || 'secret',
    expires: process.env.AUTH_SECRET_EXPIRES || '8h' 
};

export default authConfig;
