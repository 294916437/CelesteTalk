import { HttpClient } from "@/utils/fetch";
import { CreatePostData } from "@/types/post";
import { ApiResponse } from "@/types/api";

export class PostService {
  static async getHomePosts(): Promise<ApiResponse> {
    return HttpClient.get("/posts/home/");
  }

  static async getPost(id: string): Promise<ApiResponse> {
    return HttpClient.get(`/posts/${id}`);
  }
  static async getUserPost(id: string): Promise<ApiResponse> {
    return HttpClient.get(`/posts/user/${id}`);
  }
  static async deleteUserPost(id: string): Promise<ApiResponse> {
    return HttpClient.get(`/posts/${id}`);
  }
  static async createPost(data: CreatePostData, files?: File[]): Promise<ApiResponse> {
    const formData = new FormData();
    formData.append("data", JSON.stringify(data));
    if (files && files.length > 0) {
      files.forEach((file) => {
        formData.append("files", file);
      });
    }
    return HttpClient.upload("/posts", formData);
  }

  static async likePost(id: string, _id: string): Promise<ApiResponse> {
    return HttpClient.put(`/posts/${id}/like`, { data: { _id } });
  }
  static async unlikePost(id: string, _id: string): Promise<ApiResponse> {
    return HttpClient.delete(`/posts/${id}/like`, { data: { _id } });
  }
  static async repost(id: string, content: string): Promise<ApiResponse> {
    return HttpClient.post(`/posts/${id}/repost`, {
      data: { content },
    });
  }
  static async getPostComments(id: string): Promise<ApiResponse> {
    return HttpClient.get(`/posts/${id}/comments`);
  }
  static async createPostComment(
    postId: string,
    _id: string,
    content: string
  ): Promise<ApiResponse> {
    return HttpClient.post(`/posts/${postId}/comment`, { data: { _id, content } });
  }
}
