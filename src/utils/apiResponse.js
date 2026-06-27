"use strict";

const sendSuccess = (
  res,
  { statusCode = 200, message = "Success", data = null, meta = null } = {},
) => {
  const response = { success: true, message };
  if (data !== null) response.data = data;
  if (meta !== null) response.meta = meta;
  return res.status(statusCode).json(response);
};

const sendError = (
  res,
  { statusCode = 500, message = "Internal Server Error", errors = null } = {},
) => {
  const response = { success: false, message };
  if (errors !== null) response.errors = errors;
  return res.status(statusCode).json(response);
};

const sendCreated = (
  res,
  { message = "Resource created successfully", data = null } = {},
) => sendSuccess(res, { statusCode: 201, message, data });

const sendNoContent = (res) => res.status(204).send();

const getPaginationMeta = (total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

const parsePagination = (query) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 10));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

module.exports = {
  sendSuccess,
  sendError,
  sendCreated,
  sendNoContent,
  getPaginationMeta,
  parsePagination,
};
