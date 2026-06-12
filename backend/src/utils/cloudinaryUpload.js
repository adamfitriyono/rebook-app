const { cloudinary, isCloudinaryConfigured } = require('../config/cloudinary');

const DEFAULT_PRODUCT_IMAGE = 'https://picsum.photos/seed/rebook-placeholder/400/500';

function assertCloudinary() {
  if (!isCloudinaryConfigured()) {
    const err = new Error('Cloudinary belum dikonfigurasi. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, dan CLOUDINARY_API_SECRET.');
    err.status = 503;
    throw err;
  }
}

function uploadBuffer(buffer, folder) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `rebook/${folder}`,
        resource_type: 'image',
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
}

async function uploadImage(file, folder) {
  assertCloudinary();
  if (!file?.buffer) {
    throw new Error('File upload tidak valid');
  }
  return uploadBuffer(file.buffer, folder);
}

async function uploadImages(files, folder) {
  if (!files?.length) return [];
  return Promise.all(files.map((file) => uploadImage(file, folder)));
}

module.exports = {
  DEFAULT_PRODUCT_IMAGE,
  uploadImage,
  uploadImages,
  isCloudinaryConfigured,
};
