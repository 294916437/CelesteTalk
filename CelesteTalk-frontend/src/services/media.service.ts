import { HttpClient } from "@/utils/fetch";
import { ApiResponse } from "@/types/api";

interface UploadMediaData {
  _id: string;
  type: "avatar" | "header";
}

export class MediaService {
  static async uploadMedia(file: File, data: UploadMediaData): Promise<ApiResponse> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("data", JSON.stringify(data));
    return HttpClient.upload("/medias", formData);
  }
}
