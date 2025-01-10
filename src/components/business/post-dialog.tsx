"use client";

import * as React from "react";
import { Image, Video, Smile, MapPin, Calendar, X, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/basic/avatar";
import { Button } from "@/components/basic/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/data/dialog";
import { Separator } from "@/components/basic/separator";
import { ScrollArea } from "@/components/feedback/scroll-area";
import { Textarea } from "@/components/basic/textarea";
import { cn } from "@/utils/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/basic/tooltip";
import { useCreatePost } from "@/hooks/post/useCreatePost";
import { getImageUrl } from "@/utils/utils";
import { Author } from "@/types/user";
interface PostDialogProps {
  currentUser?: Author;
  onPost?: (post: {
    content: string;
    media: { type: "image" | "video"; url: string }[];
  }) => void;
}

const defaultUser: Author = {
  name: "访客",
  handle: "@guest",
  avatar: "/placeholder-avatar.jpg",
};

export function PostDialog({ currentUser = defaultUser, onPost }: PostDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [content, setContent] = React.useState("");
  const [media, setMedia] = React.useState<{ type: "image" | "video"; url: string }[]>([]);
  const [isUploading, setIsUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { createPost, isSubmitting } = useCreatePost();
  const [uploadedFiles, setUploadedFiles] = React.useState<File[]>([]);

  const handleMediaUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setIsUploading(true);
      try {
        const newFiles = Array.from(files);
        setUploadedFiles((prev) => [...prev, ...newFiles].slice(0, 4));

        const newMedia = newFiles.map((file) => ({
          type: file.type.startsWith("image/") ? ("image" as const) : ("video" as const),
          url: URL.createObjectURL(file),
        }));
        setMedia((prev) => [...prev, ...newMedia].slice(0, 4));
      } finally {
        setIsUploading(false);
      }
    }
  };

  const removeMedia = (index: number) => {
    setMedia((prev) => prev.filter((_, i) => i !== index));
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePost = async () => {
    if (!currentUser || content.trim() === "") return;

    const postData = {
      _id: currentUser.handle, // 使用 _id 而不是 handle
      content: content,
    };

    const result = await createPost(postData, uploadedFiles);

    if (result) {
      if (onPost) {
        onPost({ content, media });
      }
      setContent("");
      setMedia([]);
      setUploadedFiles([]);
      setOpen(false);
    }
  };

  const MAX_CHARS = 280;
  const remainingChars = MAX_CHARS - content.length;
  const isOverLimit = remainingChars < 0;
  const isNearLimit = remainingChars <= 20;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size='lg' className='rounded-full font-semibold w-full'>
          发帖
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[600px] top-[10%] translate-y-0'>
        <DialogHeader>
          <DialogTitle className='text-xl font-semibold'>新推文</DialogTitle>
        </DialogHeader>
        <div className='flex gap-4'>
          <Avatar className='h-10 w-10'>
            <AvatarImage src={getImageUrl(currentUser.avatar)} />
            <AvatarFallback>{currentUser.name}</AvatarFallback>
          </Avatar>
          <div className='flex-1 flex flex-col'>
            <Textarea
              placeholder='有什么新鲜事？'
              className='min-h-[120px] flex-grow resize-none border-0 bg-transparent text-xl focus-visible:ring-0 focus-visible:ring-offset-0 pb-0'
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={MAX_CHARS}
            />
            <ScrollArea className='h-full max-h-[300px] -mt-2 pr-4'>
              {media.length > 0 && (
                <div
                  className={cn(
                    "grid gap-2 w-full",
                    media.length === 1 && "grid-cols-1",
                    media.length > 1 && "grid-cols-2"
                  )}>
                  {media.map((item, index) => (
                    <div key={index} className='relative group aspect-square'>
                      {item.type === "image" ? (
                        <img
                          src={item.url}
                          alt=''
                          className='rounded-xl object-cover w-full h-full'
                          style={{ maxHeight: "250px" }}
                        />
                      ) : (
                        <video
                          src={item.url}
                          className='rounded-xl object-cover w-full h-full'
                          style={{ maxHeight: "250px" }}
                        />
                      )}
                      <Button
                        size='icon'
                        variant='destructive'
                        className='absolute hidden group-hover:flex -top-2 -right-2 z-10'
                        onClick={() => removeMedia(index)}>
                        <X className='h-4 w-4' />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
            <div className='flex items-center justify-between bg-background pt-2'>
              <TooltipProvider delayDuration={200}>
                <div className='flex items-center gap-2'>
                  <input
                    type='file'
                    hidden
                    ref={fileInputRef}
                    onChange={handleMediaUpload}
                    multiple
                    accept='image/*,video/*'
                    disabled={media.length >= 4}
                  />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant='ghost'
                        size='icon'
                        className='text-blue-500 hover:text-blue-600 hover:bg-blue-50'
                        onClick={() => fileInputRef.current?.click()}
                        disabled={media.length >= 4 || isUploading}>
                        {isUploading ? (
                          <Loader2 className='h-5 w-5 animate-spin' />
                        ) : (
                          <Image className='h-5 w-5' />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>添加图片</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant='ghost'
                        size='icon'
                        className='text-blue-500 hover:text-blue-600 hover:bg-blue-50'
                        onClick={() => fileInputRef.current?.click()}
                        disabled={media.length >= 4 || isUploading}>
                        <Video className='h-5 w-5' />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>添加视频</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant='ghost'
                        size='icon'
                        className='text-blue-500 hover:text-blue-600 hover:bg-blue-50'>
                        <Smile className='h-5 w-5' />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>表情</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant='ghost'
                        size='icon'
                        className='text-blue-500 hover:text-blue-600 hover:bg-blue-50'>
                        <Calendar className='h-5 w-5' />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>日程</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant='ghost'
                        size='icon'
                        className='text-blue-500 hover:text-blue-600 hover:bg-blue-50'>
                        <MapPin className='h-5 w-5' />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>位置</TooltipContent>
                  </Tooltip>
                </div>
              </TooltipProvider>
              <Separator orientation='vertical' className='mx-2 h-6' />
              <div className='flex items-center gap-4'>
                {content.length > 0 && (
                  <div className='flex items-center'>
                    <span
                      className={cn(
                        "text-sm",
                        isNearLimit && "text-yellow-500",
                        isOverLimit && "text-red-500"
                      )}>
                      {remainingChars}
                    </span>
                  </div>
                )}
                <Button
                  className='rounded-full'
                  disabled={isOverLimit || content.length === 0 || isSubmitting}
                  onClick={handlePost}>
                  {isSubmitting ? "发布中..." : "发布"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
