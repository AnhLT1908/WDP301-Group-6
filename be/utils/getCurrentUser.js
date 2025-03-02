function getCurrentUser(req) {
    console.log("req.user:", req.user); // Debug
    return req.user && req.user.id ? req.user.id : null;
}
export default getCurrentUser;
