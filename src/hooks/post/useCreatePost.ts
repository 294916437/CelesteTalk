import { useState } from "react";
import { CreatePostData } from "@/types/post";
import { PostService } from "@/services/post.service";
import { toast } from "react-toastify";
export function useCreatePost() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPost = async (data: CreatePostData, files?: File[]) => {
    try {
      setIsSubmitting(true);
      setError(null);
      const response = await PostService.createPost(data, files);
      if (response.code === 200) {
        toast.success("发布帖子成功");
        return response.data;
      } else {
        toast.error("发布帖子失败");
        setError(response.message || "发布帖子失败");
        return null;
      }
    } catch (err) {
      setError("发布帖子时发生错误");
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    createPost,
    isSubmitting,
    error,
  };
}
