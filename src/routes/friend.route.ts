import express from "express";
import {
  HandleRemoveFriend,
  HandleFriendRequest,
  HandleRemoveFriendRequest,
  HandleAcceptFriendRequest,
  HandleRejectFriendRequest,
  HandleBlockUser,
  HandleUnblockUser,
} from "../controllers/friend.controller.js";
import { validateFriend } from "../middleware/validateFriend.js";
import handleValidationErrors from "../middleware/handleValidationErrors.js";

const router = express.Router();

// /session/friend routes

router.use("/", validateFriend, handleValidationErrors);
router.put("/request", HandleFriendRequest);
router.delete("/request", HandleRemoveFriendRequest);
router.put("/acceptRequest", HandleAcceptFriendRequest);
router.delete("/rejectRequest", HandleRejectFriendRequest);
router.delete("/remove", HandleRemoveFriend);
router.put("/blockUser", HandleBlockUser);
router.delete("/unblockUser", HandleUnblockUser);

export { router };
