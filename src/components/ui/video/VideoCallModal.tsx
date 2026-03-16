"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Video, Mic, MicOff, VideoOff, PhoneOff } from "lucide-react";
import VideoRoom from "./VideoRoom";
import { useTranslations } from "@/providers/i18n.provider";

interface VideoCallModalProps {
  open: boolean;
  onClose: () => void;
  token: string;
  roomName: string;
  correspondentName: string;
}

export default function VideoCallModal({
  open,
  onClose,
  token,
  roomName,
  correspondentName,
}: VideoCallModalProps) {
  const dict = useTranslations();
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [roomRef, setRoomRef] = useState<any>(null);

  const handleDisconnect = useCallback(() => {
    onClose();
  }, [onClose]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const newState = !prev;
      if (roomRef) {
        roomRef.localParticipant.audioTracks.forEach((trackPub: any) => {
          if (newState) {
            trackPub.track.disable();
          } else {
            trackPub.track.enable();
          }
        });
      }
      return newState;
    });
  }, [roomRef]);

  // Toggle video
  const toggleVideo = useCallback(() => {
    setIsVideoOff((prev) => {
      const newState = !prev;
      if (roomRef) {
        roomRef.localParticipant.videoTracks.forEach((trackPub: any) => {
          if (newState) {
            trackPub.track.disable();
          } else {
            trackPub.track.enable();
          }
        });
      }
      return newState;
    });
  }, [roomRef]);

  // Escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleDisconnect();
    };
    if (open) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, handleDisconnect]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-dark/95 backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
            <Video size={20} className="text-accent" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">
              {dict.video.callWith} {correspondentName}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <p className="text-white/50 text-xs">{dict.video.inProgress}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Video area */}
      <div className="flex-1 px-6 pb-4 min-h-0">
        <VideoRoom
          roomName={roomName}
          token={token}
          onDisconnect={handleDisconnect}
        />
      </div>

      {/* Controls bar */}
      <div className="flex items-center justify-center gap-4 px-6 py-5 shrink-0">
        {/* Mute toggle */}
        <button
          onClick={toggleMute}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer ${
            isMuted
              ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
              : "bg-white/10 text-white hover:bg-white/20"
          }`}
          title={isMuted ? dict.video.unmute : dict.video.mute}
        >
          {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
        </button>

        {/* Video toggle */}
        <button
          onClick={toggleVideo}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer ${
            isVideoOff
              ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
              : "bg-white/10 text-white hover:bg-white/20"
          }`}
          title={isVideoOff ? dict.video.turnOnCamera : dict.video.turnOffCamera}
        >
          {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
        </button>

        {/* Hang up */}
        <button
          onClick={handleDisconnect}
          className="w-14 h-14 rounded-full bg-red-500 text-white flex items-center justify-center transition-all hover:bg-red-600 hover:scale-105 cursor-pointer shadow-lg shadow-red-500/25"
          title={dict.video.hangUp}
        >
          <PhoneOff size={22} />
        </button>
      </div>
    </div>
  );
}
