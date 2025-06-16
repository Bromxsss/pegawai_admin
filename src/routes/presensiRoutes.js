// src/routes/presensiRouter.js
import express from "express";
import { createPresensi, getAllPresensi, getPresensiById } from "../controllers/presensiController.js";

const router = express.Router();

router.post("/", createPresensi);
router.get("/", getAllPresensi);
router.get("/:id", getPresensiById);

export default router;

