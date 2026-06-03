import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
  let token = null;

  // 1. Try to read from cookie header
  const cookies = req.headers.cookie;
  if (cookies) {
    const tokenCookie = cookies.split(";").find((c) => c.trim().startsWith("token="));
    if (tokenCookie) {
      token = tokenCookie.split("=")[1];
    }
  }

  // 2. Fallback to authorization header if cookie is missing
  if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, token missing",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: decoded.userId,
      userId: decoded.userId,
    };
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, token invalid",
    });
  }
};

export default protect;
