import express from "express";
import {
  HandleRemoveFriend,
  HandleFriendRequest,
  HandleFriendRequestResponse,
  HandleRemoveFriendRequest,
  HandleBlockUser,
  HandleUnblockUser,
} from "../controllers/friend.controller.js";
import { accept, reject } from "../middleware/accept-reject.js";
import {
  ValidateFriendId,
  ValidateBlockUserId,
} from "../middleware/validation/friendValidationChains.js";
import handleValidationErrors from "../middleware/handleValidationErrors.js";

const router = express.Router();

// /session/friend routes

router.put(
  "/request",
  ValidateFriendId,
  handleValidationErrors,
  HandleFriendRequest,
);
router.delete(
  "/request",
  ValidateFriendId,
  handleValidationErrors,
  HandleRemoveFriendRequest,
);
router.put(
  "/acceptRequest",
  ValidateFriendId,
  handleValidationErrors,
  accept,
  HandleFriendRequestResponse,
);
router.delete(
  "/rejectRequest",
  ValidateFriendId,
  handleValidationErrors,
  reject,
  HandleFriendRequestResponse,
);
router.delete(
  "/remove",
  ValidateFriendId,
  handleValidationErrors,
  HandleRemoveFriend,
);
router.put(
  "/blockUser",
  ValidateBlockUserId,
  handleValidationErrors,
  HandleBlockUser,
);
router.delete(
  "/unblockUser",
  ValidateBlockUserId,
  handleValidationErrors,
  HandleUnblockUser,
);

export { router };
