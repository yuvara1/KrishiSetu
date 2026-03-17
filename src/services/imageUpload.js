import api from "./api";

export const URL_ENDPOINT = import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT;

export async function uploadImage(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", "/crops");

  const response = await api.post("/upload/image", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data.data.url;
}
