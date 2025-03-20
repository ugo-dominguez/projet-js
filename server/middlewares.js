module.exports = (req, res, next) => {
    const db = req.app.db;
    const ip = (req.headers['x-forwarded-for'] || req.connection.remoteAddress).split(',')[0].trim();
    
    next();
};