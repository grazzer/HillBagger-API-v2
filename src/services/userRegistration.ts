import { Request, Response } from "express";
import { authorizeUser, registerUser } from "../DataBase/userDb.js";
import { User } from "@prisma/client";

export async function userRegister(req: Request, res: Response) {
  const { name, email, password } = req.body;
  authorizeUser(email)
    .then(async (existingUser) => {
      if (existingUser) {
        console.log("User already exists:");
        return res.status(400).json({
          success: false,
          message: "An account with this Email already exists.",
        });
      }
      registerUser(name, email, password)
        .then((user) => {
          const { password, ...user_data } = user as User;
          return res.status(201).json({
            data: user_data,
            success: true,
            message: "Your account has been successfully created.",
          });
        })
        .catch((error) => {
          console.error("Error registering user:", error);
          return res
            .status(500)
            .json({ success: false, message: "Internal server error" });
        });
    })
    .catch((error) => {
      console.error("Error checking unique email:", error);
      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    });
}

///  TOLEARN: works both ways -- which is best?

// import { Request, Response, NextFunction } from "express";
// import { checkUniqueEmail, registerUser } from "../DataBase/userDb.js";
// import { Users } from "@prisma/client";

// export async function Register(req: Request, res: Response): Promise<any> {
//   const { name, email, password } = req.body;
//   try {
//     const existingUser = await checkUniqueEmail(email);
//     if (existingUser) {
//       console.log("User already exists:");
//       return res
//         .status(400)
//         .json({ error: "An account with this Email already exists." });
//     }
//     const user = await registerUser(name, email, password);
//     const { password: pw, ...user_data } = user as Users;
//     return res.status(201).json({
//       data: user_data,
//       success: true,
//       message: "Your account has been successfully created.",
//     });
//   } catch (error) {
//     console.error("Error registering user:", error);
//     return res.status(500).json({ error: "Internal server error" });
//   }
// }
