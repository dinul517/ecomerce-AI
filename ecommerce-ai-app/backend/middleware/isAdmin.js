const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    if (req.user) {
      console.log("User role in isAdmin:", req.user.role);
    }
    next();
  } else {
    res.status(403).json({ message: "Akses admin saja" });
  }
};

module.exports = { isAdmin }; 