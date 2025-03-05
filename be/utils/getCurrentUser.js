function getCurrentUser(req) {
    return req.user && req.user.id ? req.user.id : null;
}

export default getCurrentUser;