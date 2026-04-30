'use strict';

const path = require('path');
const uploadService = require('../services/upload.service');
const { success } = require('../utils/response');
const asyncHandler = require('../middlewares/asyncHandler.middleware');

exports.uploadSingle = asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
  // Magic-byte validation after disk write
  uploadService.verifyUploadedFile(req.file.path);
  const url = uploadService.getFileUrl(req.file.filename);
  return success(res, 'File uploaded', { url, filename: req.file.filename });
});

exports.uploadMultiple = asyncHandler(async (req, res) => {
  if (!req.files?.length) return res.status(400).json({ success: false, message: 'No files uploaded' });
  // Magic-byte validation for each file
  const files = req.files.map((f) => {
    uploadService.verifyUploadedFile(f.path);
    return { url: uploadService.getFileUrl(f.filename), filename: f.filename };
  });
  return success(res, 'Files uploaded', { files });
});

exports.deleteFile = asyncHandler(async (req, res) => {
  const data = await uploadService.deleteFile(req.params.filename);
  return success(res, data.message, null);
});

