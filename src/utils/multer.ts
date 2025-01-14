import { UnprocessableEntityException } from '@nestjs/common';
import * as multer from 'multer';

// nếu muốn up local

export const functionStorage = (path: string) => {
  return multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path);
    },
    filename: function (req, file, cb) {
      cb(
        null,
        new Date().toISOString().replace(/:/g, '-') + '-' + file.originalname,
      );
    },
  });
};

export const multerLocalOptions = {
  storage: functionStorage('truyền vào đường dẫn lưu file'),
  limits: {
    fileSize: 1024 * 1024 * 20,
  },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === 'image/jpeg' ||
      file.mimetype === 'image/jpg' ||
      file.mimetype === 'image/png'
    ) {
      cb(null, true);
    } else {
      cb(
        new UnprocessableEntityException('Chỉ chấp nhận ảnh jpg, jpeg, png'),
        false,
      );
    }
  },
};

// nếu muốn up lên cloud

export const multerOptions = {
  limits: {
    fileSize: 1024 * 1024 * 50, // 50 MB
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'video/mp4',
      'video/mpeg',
      'video/quicktime',
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new UnprocessableEntityException(
          'Chỉ chấp nhận file ảnh (jpg, jpeg, png) hoặc video (mp4, mpeg, mov)',
        ),
        false,
      );
    }
  },
};
