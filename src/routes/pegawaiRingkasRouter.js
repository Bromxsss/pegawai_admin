// src/routes/pegawaiRingkasRouter.js
import express from "express";
import { getAllRingkas } from "../controllers/pegawai.controller.js";

const router = express.Router();

router.get("/", getAllRingkas);

export default router;
