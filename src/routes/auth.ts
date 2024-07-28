// const express = require('express')
import express from "express"
const router = express.Router()
const { register, login, logout } = require('../controllers/auth');

router.post('/register', register)
router.post('/login', login);
router.get("/logout", logout)

module.exports = router