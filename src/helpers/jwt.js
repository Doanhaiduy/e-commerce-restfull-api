const { expressjwt: jwt } = require('express-jwt');

function authJwt() {
    const api = process.env.API_URL;
    return jwt({
        secret: process.env.SECRET_KEY,
        algorithms: ['HS256'],
        isRevoked: isRevoked,
    }).unless({
        path: [
            { url: /\/api\/v1\/products(.*)/, methods: ['GET', 'OPTIONS'] },
            { url: /\/api\/v1\/categories(.*)/, methods: ['GET', 'OPTIONS'] },
            { url: /\/api\/v1\/orders(.*)/, methods: ['GET', 'OPTIONS'] },
            { url: `/`, methods: ['GET', 'OPTIONS'] },
            { url: /\/public\/uploads(.*)/, methods: ['GET', 'OPTIONS'] },
            `${api}/users/login`,
            `${api}/users/register`,
        ],
    });
}

async function isRevoked(req, token) {
    if (!token.payload.isAdmin) {
        return true;
    }
    return false;
}

module.exports = authJwt;
