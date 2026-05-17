import { Router } from "express";
import {
    createuser,
    deleteuser,
    getUsers,
    getUserbyID,
    updateuser
} from "../controllers/user.controller"
import { jwtverify } from "../middlewares/auth.middleware";
import {validateOwner} from "../middlewares/authorize.middleware"
import { UserRole } from "../constants/roles";
import {createUserSchema, userschemavalid} from "../validators/user.validator"
import {validate} from "../middlewares/validate.middleware"

const router=Router();
router.use(jwtverify)

router.post("/",validateOwner(UserRole.ADMIN),validate(createUserSchema),createuser);
router.get("/",validateOwner(UserRole.ADMIN),getUsers);
router.get("/:id",validateOwner(UserRole.ADMIN),getUserbyID);
router.patch("/:id",validateOwner(UserRole.ADMIN),validate(userschemavalid),updateuser);
router.delete("/:id",validateOwner(UserRole.ADMIN),deleteuser);

export default router;