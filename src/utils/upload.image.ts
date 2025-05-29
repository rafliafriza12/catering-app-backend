import cloudinary from "../config/cloudinary";
import { Readable } from "stream";

class UploadImage {
  public uploadToCloudinary = (
    buffer: Buffer,
    originalName: string
  ): Promise<any> => {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "image",
          folder: "meals", // Folder di Cloudinary
          public_id: `plant_${Date.now()}_${Math.random()
            .toString(36)
            .substring(7)}`,
          transformation: [
            { width: 800, height: 600, crop: "limit" },
            { quality: "auto" },
          ],
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      const readableStream = new Readable();
      readableStream.push(buffer);
      readableStream.push(null);
      readableStream.pipe(uploadStream);
    });
  };

  // Helper function to delete image from Cloudinary
  public deleteFromCloudinary = async (imageUrl: string): Promise<boolean> => {
    try {
      // Extract public_id from Cloudinary URL
      const urlParts = imageUrl.split("/");
      const publicIdWithExtension = urlParts[urlParts.length - 1];
      const publicId = `meals/${publicIdWithExtension.split(".")[0]}`;

      const result = await cloudinary.uploader.destroy(publicId);
      console.log("Cloudinary delete result:", result);
      return result.result === "ok";
    } catch (error) {
      console.error("Error deleting from Cloudinary:", error);
      return false;
    }
  };
}

export default new UploadImage();
