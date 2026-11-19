const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'sms-jwt-super-secret-key-2026';

function requireAuth(req, res, next) {
    const token = req.cookies?.token || (req.headers.authorization && req.headers.authorization.split(' ')[1]);

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized. Please log in.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        req.session = req.session || {};
        req.session.userId = decoded.id;
        req.session.username = decoded.username;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired session. Please log in again.' });
    }
}

module.exports = requireAuth;
