"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, Settings } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface VideoPlayerProps {
    src: string;
    subtitles?: { src: string; label: string; srcLang: string }[];
}

export function VideoPlayer({ src, subtitles }: VideoPlayerProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [currentSubtitle, setCurrentSubtitle] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.volume = volume;
            videoRef.current.playbackRate = playbackRate;
        }
    }, [volume, playbackRate]);

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleProgress = () => {
        if (videoRef.current) {
            const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
            setProgress(progress);
        }
    };

    const handleSeek = (value: number[]) => {
        if (videoRef.current) {
            const time = (value[0] / 100) * videoRef.current.duration;
            videoRef.current.currentTime = time;
        }
    };

    const handleVolumeChange = (value: number[]) => {
        const newVolume = value[0] / 100;
        setVolume(newVolume);
        if (videoRef.current) {
            videoRef.current.volume = newVolume;
        }
        setIsMuted(newVolume === 0);
    };

    const toggleMute = () => {
        if (videoRef.current) {
            if (isMuted) {
                videoRef.current.volume = volume;
                setIsMuted(false);
            } else {
                videoRef.current.volume = 0;
                setIsMuted(true);
            }
        }
    };

    const toggleFullscreen = () => {
        if (containerRef.current) {
            if (!document.fullscreenElement) {
                containerRef.current.requestFullscreen();
                setIsFullscreen(true);
            } else {
                document.exitFullscreen();
                setIsFullscreen(false);
            }
        }
    };

    const togglePictureInPicture = async () => {
        if (videoRef.current) {
            if (document.pictureInPictureElement) {
                await document.exitPictureInPicture();
            } else {
                await videoRef.current.requestPictureInPicture();
            }
        }
    };

    const changePlaybackRate = (rate: number) => {
        if (videoRef.current) {
            videoRef.current.playbackRate = rate;
            setPlaybackRate(rate);
        }
    };

    const changeSubtitle = (track: TextTrack | null) => {
        if (videoRef.current) {
            for (const t of videoRef.current.textTracks) {
                t.mode = 'disabled';
            }
            if (track) {
                track.mode = 'showing';
                setCurrentSubtitle(track.label);
            } else {
                setCurrentSubtitle(null);
            }
        }
    };

    return (
        <div ref={containerRef} className="relative w-full">
            <video
                ref={videoRef}
                src={src}
                className="w-full rounded-lg"
                onClick={togglePlay}
                onTimeUpdate={handleProgress}
                onEnded={() => setIsPlaying(false)}
            >
                {subtitles && subtitles.map((subtitle, index) => (
                    <track
                        key={index}
                        kind="subtitles"
                        src={subtitle.src}
                        srcLang={subtitle.srcLang}
                        label={subtitle.label}
                    />
                ))}
            </video>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                <div className="flex items-center justify-between">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={togglePlay}
                        className="text-white hover:bg-white/20"
                    >
                        {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                    </Button>
                    <Slider
                        value={[progress]}
                        max={100}
                        step={0.1}
                        onValueChange={handleSeek}
                        className="w-full max-w-[60%] mx-4"
                    />
                    <div className="flex items-center">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleMute}
                            className="text-white hover:bg-white/20"
                        >
                            {isMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
                        </Button>
                        <Slider
                            value={[volume * 100]}
                            max={100}
                            step={1}
                            onValueChange={handleVolumeChange}
                            className="w-20 ml-2"
                        />
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                                <Settings className="h-6 w-6" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-background/95 backdrop-blur-sm border">
                            <DropdownMenuItem onClick={togglePictureInPicture}>
                                画中画
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => changePlaybackRate(0.5)}>0.5x</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => changePlaybackRate(1)}>正常</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => changePlaybackRate(1.5)}>1.5x</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => changePlaybackRate(2)}>2x</DropdownMenuItem>
                            {subtitles && [
                                <DropdownMenuItem key="off" onClick={() => changeSubtitle(null)}>
                                    字幕：关闭
                                </DropdownMenuItem>,
                                ...subtitles.map((subtitle, index) => (
                                    <DropdownMenuItem
                                        key={index}
                                        onClick={() => changeSubtitle(videoRef.current?.textTracks[index] || null)}
                                    >
                                        字幕：{subtitle.label}
                                    </DropdownMenuItem>
                                ))
                            ]}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleFullscreen}
                        className="text-white hover:bg-white/20"
                    >
                        {isFullscreen ? <Minimize className="h-6 w-6" /> : <Maximize className="h-6 w-6" />}
                    </Button>
                </div>
            </div>
        </div>
    );
}

