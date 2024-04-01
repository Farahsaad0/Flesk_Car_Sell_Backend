const User = require("../Models/User");

const handleLogout = async (req, res) => {
  // On client, also delete the accessToken
  const cookies = req.cookies;
  console.log("_1_ " + cookies?.refreshToken); //! ____DEBUGGING_ONLY_REMEMBER_TO_DELETE_LATER____ 
//   if (!cookies) console.log("_2_ " + cookies.refreshToken); //! ____DEBUGGING_ONLY_REMEMBER_TO_DELETE_LATER____ 
if (!cookies?.refreshToken) console.log("_2_ " + cookies?.refreshToken); //! ____DEBUGGING_ONLY_REMEMBER_TO_DELETE_LATER____ 
  if (!cookies?.refreshToken) return res.sendStatus(204); //No content
  if (cookies?.refreshToken) console.log("_3_ " + cookies.refreshToken); 
  console.log("_4_ " + cookies.refreshToken); //! ____DEBUGGING_ONLY_REMEMBER_TO_DELETE_LATER____
  const refreshToken = cookies.refreshToken;

  // Is refreshToken in db?
  const foundUser = await User.findOne({ refreshToken });
  if (!foundUser) {
    res.clearCookie("refreshToken", { httpOnly: true, sameSite: "None", secure: true });
    console.log("no user found"); //! ____DEBUGGING_ONLY_REMEMBER_TO_DELETE_LATER____
    return res.sendStatus(204);
  }

  // Delete refreshToken in db
  foundUser.refreshToken = "";
  console.log("foundUser.refreshToken = " + foundUser.refreshToken); //! ____DEBUGGING_ONLY_REMEMBER_TO_DELETE_LATER____
  const result = await foundUser.save();
  console.log(result);

  res.clearCookie("refreshToken", { httpOnly: true, sameSite: "None", secure: true });
  res.sendStatus(204);
};

module.exports = { handleLogout };
