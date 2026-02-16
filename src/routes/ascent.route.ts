import express from "express";
import {
  handleCreateAscent,
  handleRequestJoinExistingAscent,
  handleResponseToUserRequestingToJoinAscent,
  handleRemoveRequestToJoinAscent,
  handleResponseToUserInvitedToJoinAscent,
  handleRemoveInvitedUser,
  handleUpdateAscent,
  handleLeaveAscent,
} from "../controllers/ascent.controller.js";
import {
  ValidateCreateAscent,
  ValidateJoinRequest,
  ValidateRespondToJoinRequest,
  ValidateRemoveJoinRequest,
  ValidateRespondToInvite,
  ValidateRemoveInvitedUser,
  ValidateUpdateAscent,
  ValidateLeaveAscent,
} from "../middleware/validation/ascentValidationChains.js";
import { accept, reject } from "../middleware/accept-reject.js";
import handleValidationErrors from "../middleware/handleValidationErrors.js";

const router = express.Router();

// /session/ascent routes

router.post(
  "/create",
  ValidateCreateAscent,
  handleValidationErrors,
  handleCreateAscent,
);

router.put(
  "/join/request",
  ValidateJoinRequest,
  handleValidationErrors,
  handleRequestJoinExistingAscent,
);
router.put(
  "/join/accept",
  ValidateRespondToJoinRequest,
  handleValidationErrors,
  accept,
  handleResponseToUserRequestingToJoinAscent,
);
router.put(
  "/join/reject",
  ValidateRespondToJoinRequest,
  handleValidationErrors,
  reject,
  handleResponseToUserRequestingToJoinAscent,
);
router.delete(
  "/join/remove",
  ValidateRemoveJoinRequest,
  handleValidationErrors,
  handleRemoveRequestToJoinAscent,
);

router.put(
  "/invite/accept",
  ValidateRespondToInvite,
  handleValidationErrors,
  accept,
  handleResponseToUserInvitedToJoinAscent,
);
router.put(
  "/invite/reject",
  ValidateRespondToInvite,
  handleValidationErrors,
  reject,
  handleResponseToUserInvitedToJoinAscent,
);
router.delete(
  "/invite/remove",
  ValidateRemoveInvitedUser,
  handleValidationErrors,
  handleRemoveInvitedUser,
);

router.put(
  "/update",
  ValidateUpdateAscent,
  handleValidationErrors,
  handleUpdateAscent,
);
router.delete(
  "/leave",
  ValidateLeaveAscent,
  handleValidationErrors,
  handleLeaveAscent,
); // if last to leave it will delete the ascent

export { router };
