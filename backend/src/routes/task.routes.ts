import { Router } from "express";
import {
    createTask,
    deleteTask,
    updateTask,
    getTaskById,
    getalltasks
} from "../controllers/task.controller"
import {updateTaskSchema,createTaskSchema} from "../validators/task.validator"
import { jwtverify } from "../middlewares/auth.middleware";
import {validate} from "../middlewares/validate.middleware"
import {validateQuery} from "../middlewares/query.middleware"
import { taskQuerySchema } from "../validators/query.validator";

const router = Router();

router.use(jwtverify);

router.post("/",validate(createTaskSchema), createTask);
router.get("/", validateQuery(taskQuerySchema), getalltasks);
router.get("/:id", getTaskById)
router.patch("/:id",validate(updateTaskSchema),updateTask);
router.delete("/:id", deleteTask);

export default router;