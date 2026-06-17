import axios from "axios";
import FormData from "form-data";

/**
 * Uploads an image buffer to ImgBB and returns the URL.
 * @param {Buffer} buffer - The image buffer from multer.
 * @returns {Promise<string>} - The direct image URL.
 */
export const uploadToImgBB = async (buffer) => {
  try {
    const formData = new FormData();
    formData.append("image", buffer.toString("base64"));

    const response = await axios.post(
      `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
      formData,
      {
        headers: formData.getHeaders(),
      }
    );

    if (response.data && response.data.data && response.data.data.url) {
      return response.data.data.url;
    }
    throw new Error("Invalid response from ImgBB");
  } catch (error) {
    console.error("ImgBB Upload Error:", error.response?.data || error.message);
    throw new Error("Image upload failed");
  }
};
