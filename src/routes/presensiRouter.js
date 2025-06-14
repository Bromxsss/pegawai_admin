// src/routes/presensiRouter.js
import express from "express";
import { createPresensi, getAllPresensi } from "../controllers/presensiController.js";

const router = express.Router();

router.post("/", createPresensi);
router.get("/", getAllPresensi);

export default router;

