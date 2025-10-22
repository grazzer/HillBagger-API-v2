import express from "express";
import { HandleGetProfile } from "../controllers/profile.js";
import {
  HandleRemoveFriend,
  HandleFriendRequest,
  HandleRemoveFriendRequest,
  HandleAcceptFriendRequest,
  HandleRejectFriendRequest,
  HandleBlockUser,
  HandleUnblockUser,
} from "../controllers/frends.js";
import {
  validateFriendID,
  validateBlockUserID,
} from "../middleware/validateFriendID.js";
import handleValidationErrors from "../middleware/handleValidationErrors.js";

const router = express.Router();

router.get("/profile", HandleGetProfile);

router.use("/friend", validateFriendID, handleValidationErrors);
router.put("/friend/request", HandleFriendRequest);
router.delete("/friend/request", HandleRemoveFriendRequest);
router.put("/friend/acceptRequest", HandleAcceptFriendRequest);
router.delete("/friend/rejectRequest", HandleRejectFriendRequest);
router.delete("/friend/remove", HandleRemoveFriend);

router.use("/", validateBlockUserID, handleValidationErrors);
router.put("/blockUser", HandleBlockUser);
router.delete("/unblockUser", HandleUnblockUser);

export { router };
