const API_BASE_URL = "https://api.almostcrackd.ai";

type PresignedUrlResponse = {
  presignedUrl: string;
  cdnUrl: string;
};

type RegisterImageResponse = {
  imageId: string;
  now: number;
};

export async function generatePresignedUrl(
  contentType: string,
  token: string
): Promise<PresignedUrlResponse> {

  const res = await fetch(`${API_BASE_URL}/pipeline/generate-presigned-url`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ contentType }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `Failed to generate presigned URL (${res.status}): ${text || res.statusText}`
    );
  }

  return (await res.json()) as PresignedUrlResponse;
}

export async function uploadImageToPresignedUrl(
  presignedUrl: string,
  file: File
): Promise<void> {
  const res = await fetch(presignedUrl, {
    method: "PUT",
    headers: {
      "Content-Type": file.type,
    },
    body: file,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `Failed to upload image to storage (${res.status}): ${
        text || res.statusText
      }`
    );
  }
}

export async function registerImageUrl(
  cdnUrl: string,
  token: string
): Promise<RegisterImageResponse> {

  const res = await fetch(`${API_BASE_URL}/pipeline/upload-image-from-url`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      imageUrl: cdnUrl,
      isCommonUse: false,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `Failed to register image URL (${res.status}): ${text || res.statusText}`
    );
  }

  return (await res.json()) as RegisterImageResponse;
}

export async function generateCaptionsForImage(imageId: string, token: string) {

  const res = await fetch(`${API_BASE_URL}/pipeline/generate-captions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ imageId }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `Failed to generate captions (${res.status}): ${text || res.statusText}`
    );
  }

  // The API returns an array of caption records; we don’t need the exact shape here
  return await res.json();
}

