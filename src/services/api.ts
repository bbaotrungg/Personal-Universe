import type { UniverseContent, AuthSession } from '../types';

const API_BASE = '/api';

/**
 * Lấy nội dung đã xuất bản (dành cho chế độ Public / khách truy cập)
 */
export async function getPublishedContent(): Promise<UniverseContent> {
  const res = await fetch(`${API_BASE}/content`);
  if (!res.ok) {
    throw new Error(`Không thể tải dữ liệu đã xuất bản: ${res.statusText}`);
  }
  const json = await res.json();
  const data = json.data || json;
  if (data && data.content && data.content.personal) {
    return {
      ...data.content,
      lastPublishedAt: data.lastPublishedAt || data.content.lastPublishedAt,
    };
  }
  return data;
}

/**
 * Lấy nội dung bản nháp (chỉ dành cho Owner đã xác thực)
 */
export async function getDraftContent(token: string): Promise<UniverseContent> {
  const res = await fetch(`${API_BASE}/content/draft`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    if (res.status === 401) {
      throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
    }
    throw new Error(`Không thể tải bản nháp: ${res.statusText}`);
  }
  const json = await res.json();
  const data = json.data || json;
  if (data && data.content && data.content.personal) {
    return {
      ...data.content,
      lastPublishedAt: data.lastPublishedAt || data.content.lastPublishedAt,
    };
  }
  return data;
}

/**
 * Lưu bản nháp (chỉ dành cho Owner)
 */
export async function saveDraftContent(
  token: string,
  content: UniverseContent
): Promise<{ success: boolean; updatedAt: string }> {
  const res = await fetch(`${API_BASE}/content/draft`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(content),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Lưu bản nháp thất bại: ${res.statusText}`);
  }
  return res.json();
}

/**
 * Xuất bản nội dung từ bản nháp ra phiên bản công khai
 */
export async function publishContent(
  token: string
): Promise<{ success: boolean; publishedAt: string }> {
  const res = await fetch(`${API_BASE}/content/publish`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Xuất bản thất bại: ${res.statusText}`);
  }
  return res.json();
}

/**
 * Xác thực Owner Access Code
 */
export async function verifyOwnerCode(
  accessCode: string
): Promise<AuthSession> {
  try {
    const res = await fetch(`${API_BASE}/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ accessCode, code: accessCode }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.error || 'Mã truy cập không hợp lệ.');
    }

    const data = await res.json();
    return {
      token: data.token,
      expiresAt: data.expiresAt,
    };
  } catch (err: unknown) {
    if (err instanceof TypeError && err.message.toLowerCase().includes('fetch')) {
      throw new Error('Không thể kết nối đến máy chủ backend (Port 3001). Vui lòng đảm bảo server đang chạy (npm run dev hoặc npm run server).');
    }
    throw err;
  }
}

/**
 * Kiểm tra token phiên còn hợp lệ không
 */
export async function checkSessionToken(token: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/auth/check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ token }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    return !!data.valid;
  } catch {
    return false;
  }
}

/**
 * Đăng xuất kết thúc phiên Owner
 */
export async function logoutOwner(token: string): Promise<void> {
  try {
    await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });
  } catch {
    // Silent catch on logout
  }
}

/**
 * Tải ảnh lên Cloudinary qua chữ ký Worker (hoặc fallback server)
 */
export async function uploadImage(
  token: string,
  file: File
): Promise<{ success: boolean; url: string; filename: string }> {
  try {
    // 1. Thử xin chữ ký upload trực tiếp lên Cloudinary từ Worker
    const signRes = await fetch(`${API_BASE}/upload/sign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ resourceType: 'image' }),
    });

    if (signRes.ok) {
      const signData = await signRes.json();
      if (signData.success && signData.cloudName && signData.signature) {
        const cloudForm = new FormData();
        cloudForm.append('file', file);
        cloudForm.append('api_key', signData.apiKey);
        cloudForm.append('timestamp', String(signData.timestamp));
        cloudForm.append('signature', signData.signature);
        cloudForm.append('folder', signData.folder);
        cloudForm.append('public_id', signData.publicId);

        const cloudRes = await fetch(
          `https://api.cloudinary.com/v1_1/${signData.cloudName}/image/upload`,
          {
            method: 'POST',
            body: cloudForm,
          }
        );

        if (cloudRes.ok) {
          const cloudData = await cloudRes.json();
          // Thông báo cho Worker lưu metadata vào D1
          fetch(`${API_BASE}/upload/complete`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              publicId: cloudData.public_id,
              secureUrl: cloudData.secure_url,
              size: cloudData.bytes || file.size,
              contentType: file.type,
              resourceType: 'image',
            }),
          }).catch((err) => console.warn('Lỗi ghi nhận metadata D1:', err));

          return {
            success: true,
            url: cloudData.secure_url,
            filename: cloudData.public_id,
          };
        }
      }
    }
  } catch (err) {
    console.warn('Direct Cloudinary upload unavailable, falling back:', err);
  }

  // 2. Fallback sang server upload (Express local dev và Worker-mediated)
  const formData = new FormData();
  formData.append('image', file);

  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || 'Tải ảnh lên thất bại');
  }

  return res.json();
}

/**
 * Tải file nhạc MP3 lên Cloudinary qua chữ ký Worker (hoặc fallback server)
 */
export async function uploadAudio(
  token: string,
  file: File
): Promise<{ success: boolean; url: string; filename: string; originalName?: string }> {
  try {
    // 1. Thử xin chữ ký upload trực tiếp lên Cloudinary từ Worker (resource_type: video)
    const signRes = await fetch(`${API_BASE}/upload/sign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ resourceType: 'video' }),
    });

    if (signRes.ok) {
      const signData = await signRes.json();
      if (signData.success && signData.cloudName && signData.signature) {
        const cloudForm = new FormData();
        cloudForm.append('file', file);
        cloudForm.append('api_key', signData.apiKey);
        cloudForm.append('timestamp', String(signData.timestamp));
        cloudForm.append('signature', signData.signature);
        cloudForm.append('folder', signData.folder);
        cloudForm.append('public_id', signData.publicId);

        // Chú ý: Cloudinary yêu cầu resource_type là 'video' cho file âm thanh MP3
        const cloudRes = await fetch(
          `https://api.cloudinary.com/v1_1/${signData.cloudName}/video/upload`,
          {
            method: 'POST',
            body: cloudForm,
          }
        );

        if (cloudRes.ok) {
          const cloudData = await cloudRes.json();
          // Lưu metadata vào D1
          fetch(`${API_BASE}/upload/complete`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              publicId: cloudData.public_id,
              secureUrl: cloudData.secure_url,
              size: cloudData.bytes || file.size,
              contentType: file.type || 'audio/mpeg',
              resourceType: 'video',
              originalFilename: file.name,
            }),
          }).catch((err) => console.warn('Lỗi ghi nhận metadata D1:', err));

          return {
            success: true,
            url: cloudData.secure_url,
            filename: cloudData.public_id,
            originalName: file.name,
          };
        }
      }
    }
  } catch (err) {
    console.warn('Direct Cloudinary audio upload unavailable, falling back:', err);
  }

  // 2. Fallback sang server upload
  const formData = new FormData();
  formData.append('audio', file);

  const res = await fetch(`${API_BASE}/upload-audio`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || 'Tải file âm thanh thất bại');
  }

  return res.json();
}

/**
 * Xóa file âm thanh khỏi máy chủ
 */
export async function deleteAudio(
  token: string,
  filename: string
): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/audio`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ filename }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || 'Xóa file nhạc thất bại');
  }

  return res.json();
}
