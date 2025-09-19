import { Router } from "express";
import { queueController } from "../controllers/queue.controller.js";
import { validateBody } from "../middlewares/validate.js";
import { triageCreateSchema } from "../dto/triage.dto.js";
import { reprioritizeSchema } from "../dto/queue.dto.js";

export const queueRouter = Router();

queueRouter.post("/triage", validateBody(triageCreateSchema), queueController.triageCreate);
queueRouter.get("/queue", queueController.getQueue);
queueRouter.post("/queue/next", queueController.next);
// en queue.routes.ts
import { verifyAccess, requireRoles } from "../middlewares/auth.js";

queueRouter.post("/queue/complete/:id",
  verifyAccess,
  requireRoles("medico", "admin"),
  queueController.complete
);

queueRouter.patch("/queue/:id/urgency", validateBody(reprioritizeSchema), queueController.reprioritize);

// solo test
if (process.env.NODE_ENV === "test") {
  queueRouter.post("/__test__/reset", queueController.__testReset);
}


