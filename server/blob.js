const { put } = require("@vercel/blob");

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

async function uploadImage(file, pathPrefix) {
  if (!ALLOWED_TYPES.has(file.mimetype)) {
    throw new Error("Formato de imagem não suportado. Use JPG, PNG, WEBP ou GIF.");
  }
  const ext = file.originalname.split(".").pop().slice(0, 5);
  const pathname = `${pathPrefix}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const blob = await put(pathname, file.buffer, {
    access: "public",
    contentType: file.mimetype,
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });
  return blob.url;
}

module.exports = { uploadImage };
