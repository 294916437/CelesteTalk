import { useState } from "react";
import { Post } from "@/types/post";

export function useImagePreview() {
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [initialImageIndex, setInitialImageIndex] = useState(0);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleImageClick = (post: Post, index: number, event: React.MouseEvent) => {
    event.stopPropagation();
    const images = post.media?.filter((m) => m.type === "image").map((m) => m.url) || [];
    setPreviewImages(images);
    setInitialImageIndex(index);
    setIsPreviewOpen(true);
  };

  return {
    previewImages,
    initialImageIndex,
    isPreviewOpen,
    setIsPreviewOpen,
    handleImageClick,
  };
}
