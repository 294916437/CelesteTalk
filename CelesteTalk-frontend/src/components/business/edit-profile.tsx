"use client";

import { useState, useRef } from "react";
import { useUserStore } from "@/store/user.store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/data/dialog";
import { Button } from "@/components/basic/button";
import { Input } from "@/components/basic/input";
import { Textarea } from "@/components/basic/textarea";
import { Label } from "@/components/basic/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/basic/avatar";
import { Camera } from "lucide-react";
import { toast } from "react-toastify";
import { MediaService } from "@/services/media.service";
import { getImageUrl } from "@/utils/utils";
import { useRouter } from "next/navigation";
import { Profile } from "@/types/profile";
interface EditProfileProps {
  profile: Profile;
  onSave: (updatedProfile: any) => void;
}

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function EditProfile({ profile, onSave }: EditProfileProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(profile.name);
  const [bio, setBio] = useState(profile.bio ?? "");
  const [avatarPreview, setAvatarPreview] = useState(getImageUrl(profile.avatar));
  const [headerPreview, setHeaderPreview] = useState(getImageUrl(profile.headerImage));
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [headerFile, setHeaderFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { user, setUser } = useUserStore();

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const headerInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File) => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast.error("只支持 JPG、JPEG、PNG、GIF、和 WebP 格式的图片");
      return false;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error("图片大小不能超过 5MB");
      return false;
    }
    return true;
  };

  const uploadImage = async (file: File | null, type: "avatar" | "header") => {
    if (!file || !user) return null;
    try {
      const uploadData = {
        _id: profile.handle,
        type: type,
      };
      const response = await MediaService.uploadMedia(file, uploadData);
      if (response.code === 200 && response.data) {
        const imageUrl = getImageUrl(response.data.url);
        // 更新预览和store中的用户数据
        if (type === "avatar") {
          toast.success("更新头像成功");
          setAvatarPreview(imageUrl);
          setUser({
            ...user,
            avatar: response.data.url,
          });
          onSave({ ...profile, avatar: response.data.url });
        } else if (type === "header") {
          toast.success("更新封面成功");
          setHeaderPreview(imageUrl);
          setUser({
            ...user,
            headerImage: response.data.url,
          });
          onSave({ ...profile, headerImage: response.data.url });
        }

        // 刷新页面以获取新图片
        router.refresh();
      } else {
        throw new Error("上传失败");
      }
    } catch (error) {}
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
    type: "avatar" | "header"
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!validateFile(file)) {
      event.target.value = "";
      return;
    }

    // 先显示本地预览
    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === "avatar") {
        setAvatarPreview(reader.result as string);
        setAvatarFile(file);
      } else if (type === "header") {
        setHeaderPreview(reader.result as string);
        setHeaderFile(file);
      }
    };
    reader.readAsDataURL(file);

    // 立即上传图片
    await uploadImage(file, type);
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      // 只更新基本信息
      onSave({
        name,
        bio,
      });
      toast.success("资料更新成功");
      setOpen(false);
    } catch (error) {
      toast.error("保存失败，请重试");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant='outline'
          className='rounded-full font-semibold bg-background hover:bg-muted/50 hover:text-foreground'>
          编辑资料
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle className='text-xl'>编辑资料</DialogTitle>
        </DialogHeader>
        <div className='grid gap-6 pt-4'>
          <div className='relative'>
            <div className='h-32 w-full bg-muted relative rounded-lg overflow-hidden'>
              {headerPreview ? (
                <img src={headerPreview} alt='Header' className='w-full h-full object-cover' />
              ) : (
                <div className='w-full h-full bg-muted' />
              )}
              <input
                ref={headerInputRef}
                type='file'
                accept={ALLOWED_IMAGE_TYPES.join(",")}
                className='hidden'
                onChange={(e) => handleFileChange(e, "header")}
              />
              <Button
                size='icon'
                className='absolute bottom-2 right-2 bg-black/50 hover:bg-black/70'
                onClick={() => headerInputRef.current?.click()}>
                <Camera className='h-4 w-4' />
              </Button>
            </div>
            <div className='absolute -bottom-16 left-4'>
              <div className='relative'>
                <Avatar className='h-32 w-32 border-4 border-background rounded-full'>
                  <AvatarImage src={avatarPreview} />
                  <AvatarFallback>{name[0]}</AvatarFallback>
                </Avatar>
                <input
                  ref={avatarInputRef}
                  type='file'
                  accept={ALLOWED_IMAGE_TYPES.join(",")}
                  className='hidden'
                  onChange={(e) => handleFileChange(e, "avatar")}
                />
                <Button
                  size='icon'
                  className='absolute bottom-0 right-0 bg-black/50 hover:bg-black/70'
                  onClick={() => avatarInputRef.current?.click()}>
                  <Camera className='h-4 w-4' />
                </Button>
              </div>
            </div>
          </div>
          <div className='mt-16'>
            <Label htmlFor='name' className='text-base font-medium'>
              名称
            </Label>
            <Input
              id='name'
              value={name}
              onChange={(e) => setName(e.target.value)}
              className='mt-1.5'
            />
          </div>
          <div>
            <Label htmlFor='bio' className='text-base font-medium'>
              个人简介
            </Label>
            <Textarea
              id='bio'
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className='mt-1.5 resize-none'
              rows={3}
            />
          </div>
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className='w-full bg-accent text-accent-foreground hover:bg-accent-dark rounded-full'>
            {isLoading ? "保存中..." : "保存"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
