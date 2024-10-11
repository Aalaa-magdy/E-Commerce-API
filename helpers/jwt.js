const { expressjwt: expressJwt } = require('express-jwt');
const api = process.env.API_URL;

function authJwt() {

  const secret = process.env.secret;
  return expressJwt({
    secret,
    algorithms: ['HS256'],
    isRevoked: isRevoked
  }).unless({
    path: [  
      { url: /\/public\/uploads(.*)/, methods: ['GET', 'OPTIONS'] },
      { url: /\/api\/v1\/products(.*)/, methods: ['GET', 'OPTIONS'] },
      { url: /\/api\/v1\/categories(.*)/, methods: ['GET', 'OPTIONS'] },
      `${api}/users/login`,
      `${api}/users/register`, // Removed extra slash
    ]
  });
}

async function isRevoked(req, token) {
  try {
    // Check if the user is admin
    if (!token.payload.isAdmin) {
      return true; // Deny access
    }
    return false; // Allow access
  } catch (error) {
    return true; // In case of an error, deny access
  }
}
module.exports = authJwt;
