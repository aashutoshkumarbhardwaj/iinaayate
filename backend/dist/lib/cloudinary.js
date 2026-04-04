"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cloudinaryConfigured = exports.cloudinary = void 0;
const cloudinary_1 = require("cloudinary");
Object.defineProperty(exports, "cloudinary", { enumerable: true, get: function () { return cloudinary_1.v2; } });
const hasUrl = !!process.env.CLOUDINARY_URL;
const hasKeys = !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
const cloudinaryConfigured = hasUrl || hasKeys;
exports.cloudinaryConfigured = cloudinaryConfigured;
if (cloudinaryConfigured) {
    // Build options only with defined values to satisfy TS (exactOptionalPropertyTypes)
    const opts = { secure: true };
    if (process.env.CLOUDINARY_CLOUD_NAME)
        opts.cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
    if (process.env.CLOUDINARY_API_KEY)
        opts.api_key = process.env.CLOUDINARY_API_KEY;
    if (process.env.CLOUDINARY_API_SECRET)
        opts.api_secret = process.env.CLOUDINARY_API_SECRET;
    cloudinary_1.v2.config(opts);
}
//# sourceMappingURL=cloudinary.js.map