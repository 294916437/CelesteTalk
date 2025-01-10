import { HttpClient } from "@/utils/fetch";
import { ApiResponse } from "@/types/api";

export class PostService {
  static async getPostComments(): Promise<ApiResponse> {
    return HttpClient.get("/posts/home/");
  }
  static async toggleComment(commentId: string, userId: string): Promise<ApiResponse> {
    return HttpClient.post(`/comments/${commentId}/toggle`, { data: { commentId, userId } });
  }
}
