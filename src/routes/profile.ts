import express from "express";
import { getProfile } from "../services/profile.js";
import {
  removeFriend,
  friendRequest,
  removeFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  blockUser,
  unblockUser,
} from "../services/frends.js";
import {
  validateFriendID,
  validateBlockUserID,
} from "../middleware/validateFriendID.js";
import handleValidationErrors from "../middleware/handleValidationErrors.js";

const router = express.Router();

router.get("/profile", getProfile);

router.use("/friend", validateFriendID, handleValidationErrors);
router.put("/friend/request", friendRequest);
router.delete("/friend/request", removeFriendRequest);
router.put("/friend/acceptRequest", acceptFriendRequest);
router.delete("/friend/rejectRequest", rejectFriendRequest);
router.delete("/friend/remove", removeFriend);

router.use(validateBlockUserID, handleValidationErrors);
router.put("/blockUser", blockUser);
router.delete("/unblockUser", unblockUser);

export { router };
