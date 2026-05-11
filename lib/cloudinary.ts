const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export class UploadError extends Error {
  constructor(message: string, public readonly code?: string) {
    super(message);
    this.name = 'UploadError';
  }
}

export function uploadToCloudinary(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    return Promise.reject(new UploadError('请选择图片文件'));
  }

  if (file.size > MAX_FILE_SIZE) {
    return Promise.reject(new UploadError('图片大小不能超过 5MB'));
  }

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    return Promise.reject(new UploadError('Cloudinary 未配置，请检查环境变量'));
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);

  return fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  })
    .then(async (res) => {
      if (!res.ok) {
        let msg = `上传失败 (${res.status})`;
        try {
          const body = await res.json();
          if (body.error?.message) msg = body.error.message;
        } catch {}
        throw new UploadError(msg);
      }
      return res.json();
    })
    .then((data) => {
      if (!data.secure_url) {
        throw new UploadError('上传失败：未获取到图片地址');
      }
      return data.secure_url as string;
    })
    .catch((err) => {
      if (err instanceof UploadError) throw err;
      throw new UploadError('上传失败，请检查网络后重试');
    });
}

export function transformUrl(secureUrl: string, options?: { width?: number; quality?: string }): string {
  if (!secureUrl.includes('res.cloudinary.com')) return secureUrl;

  const parts = secureUrl.split('/upload/');
  if (parts.length !== 2) return secureUrl;

  const transforms: string[] = [];
  if (options?.width) transforms.push(`w_${options.width}`);
  if (options?.quality) transforms.push(`q_${options.quality}`);

  if (transforms.length === 0) return secureUrl;
  return `${parts[0]}/upload/${transforms.join(',')}/${parts[1]}`;
}
