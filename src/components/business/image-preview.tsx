"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/data/dialog";
import { Button } from "@/components/basic/button";
import { cn } from "@/utils/utils";
import { VisuallyHidden } from "@/components/feedback/visually-hidden";

interface ImagePreviewProps {
  images: string[];
  initialIndex?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImagePreview({
  images,
  initialIndex = 0,
  open,
  onOpenChange,
}: ImagePreviewProps) {
  const [currentIndex, setCurrentIndex] = React.useState(initialIndex);
  const [touchStart, setTouchStart] = React.useState<number | null>(null);
  const [touchEnd, setTouchEnd] = React.useState<number | null>(null);

  React.useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : prev));
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowLeft") {
      handlePrevious();
    } else if (event.key === "ArrowRight") {
      handleNext();
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrevious();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className='max-w-7xl h-[80vh] p-0 gap-0 bg-background/95 backdrop-blur-sm'
        onKeyDown={handleKeyDown}>
        <DialogTitle asChild>
          <VisuallyHidden>
            查看图片 {currentIndex + 1} / {images.length}
          </VisuallyHidden>
        </DialogTitle>
        <div className='relative flex items-center justify-center w-full h-full'>
          <Button
            variant='ghost'
            size='icon'
            className='absolute right-2 top-2 z-50 rounded-full bg-background/80 hover:bg-background/90'
            onClick={() => onOpenChange(false)}>
            <X className='h-4 w-4' />
          </Button>

          <div
            className='relative w-full h-full flex items-center justify-center'
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}>
            {images.map((src, index) => (
              <img
                key={src}
                src={src}
                alt=''
                className={cn(
                  "absolute w-full h-full transition-all duration-300 object-contain",
                  index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
                )}
              />
            ))}
          </div>

          {currentIndex > 0 && (
            <Button
              variant='ghost'
              size='icon'
              className='absolute left-2 z-50 rounded-full bg-background/80 hover:bg-background/90'
              onClick={handlePrevious}>
              <ChevronLeft className='h-4 w-4' />
            </Button>
          )}

          {currentIndex < images.length - 1 && (
            <Button
              variant='ghost'
              size='icon'
              className='absolute right-2 z-50 rounded-full bg-background/80 hover:bg-background/90'
              onClick={handleNext}>
              <ChevronRight className='h-4 w-4' />
            </Button>
          )}

          {images.length > 1 && (
            <div className='absolute bottom-4 left-0 right-0 flex justify-center gap-1'>
              {images.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "w-1.5 h-1.5 rounded-full transition-all duration-300",
                    index === currentIndex ? "bg-primary" : "bg-muted"
                  )}
                />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
