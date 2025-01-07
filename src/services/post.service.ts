import { HttpClient } from "@/utils/fetch";
import { Post, CreatePostData } from "@/types/post";
import { ApiResponse } from "@/types/api";

export class PostService {
  static async getPosts(): Promise<ApiResponse<{ posts: Post[] }>> {
    return HttpClient.get("/posts");
  }

  static async getPost(id: string): Promise<ApiResponse<{ post: Post }>> {
    return HttpClient.get(`/posts/${id}`);
  }

  static async createPost(data: CreatePostData): Promise<ApiResponse<{ post: Post }>> {
    return HttpClient.post("/posts", { data });
  }

  static async likePost(id: string): Promise<ApiResponse<void>> {
    return HttpClient.put(`/posts/${id}/like`);
  }

  static async repost(id: string, content: string): Promise<ApiResponse<{ post: Post }>> {
    return HttpClient.post(`/posts/${id}/repost`, {
      data: { content },
    });
  }

  static async uploadMedia(files: File[]): Promise<ApiResponse<{ urls: string[] }>> {
    return HttpClient.upload("/posts/media", files);
  }
}
