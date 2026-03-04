"use client";

import React, { useState, useEffect, useRef } from "react";
import type {
  RemoteParticipant,
  LocalParticipant,
  RemoteTrackPublication,
  LocalTrackPublication,
  RemoteVideoTrack,
  LocalVideoTrack,
  RemoteAudioTrack,
  LocalAudioTrack,
} from "twilio-video";

type TwilioParticipant = RemoteParticipant | LocalParticipant;
type TrackPublication = RemoteTrackPublication | LocalTrackPublication;
type TwilioVideoTrack = RemoteVideoTrack | LocalVideoTrack;
type TwilioAudioTrack = RemoteAudioTrack | LocalAudioTrack;

interface VideoParticipantProps {
  participant: TwilioParticipant;
  isLocal?: boolean;
}

export default function VideoParticipant({
  participant,
  isLocal = false,
}: VideoParticipantProps) {
  const [videoTracks, setVideoTracks] = useState<TwilioVideoTrack[]>([]);
  const [audioTracks, setAudioTracks] = useState<TwilioAudioTrack[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Subscribe / unsubscribe to tracks
  useEffect(() => {
    const trackSubscribed = (track: { kind: string }) => {
      if (track.kind === "video") {
        setVideoTracks((prev) => [...prev, track as TwilioVideoTrack]);
      } else if (track.kind === "audio") {
        setAudioTracks((prev) => [...prev, track as TwilioAudioTrack]);
      }
    };

    const trackUnsubscribed = (track: { kind: string }) => {
      if (track.kind === "video") {
        setVideoTracks((prev) => prev.filter((v) => v !== track));
      } else if (track.kind === "audio") {
        setAudioTracks((prev) => prev.filter((a) => a !== track));
      }
    };

    // Get initial tracks
    const existingVideoTracks: TwilioVideoTrack[] = [];
    const existingAudioTracks: TwilioAudioTrack[] = [];

    participant.videoTracks.forEach((pub: TrackPublication) => {
      if (pub.track) existingVideoTracks.push(pub.track as TwilioVideoTrack);
    });
    participant.audioTracks.forEach((pub: TrackPublication) => {
      if (pub.track) existingAudioTracks.push(pub.track as TwilioAudioTrack);
    });

    setVideoTracks(existingVideoTracks);
    setAudioTracks(existingAudioTracks);

    participant.on("trackSubscribed", trackSubscribed);
    participant.on("trackUnsubscribed", trackUnsubscribed);

    return () => {
      setVideoTracks([]);
      setAudioTracks([]);
      participant.removeAllListeners();
    };
  }, [participant]);

  // Attach video track to DOM
  useEffect(() => {
    const videoTrack = videoTracks[0];
    if (videoTrack && videoRef.current) {
      videoTrack.attach(videoRef.current);
      return () => {
        videoTrack.detach();
      };
    }
  }, [videoTracks]);

  // Attach audio track to DOM
  useEffect(() => {
    const audioTrack = audioTracks[0];
    if (audioTrack && audioRef.current) {
      audioTrack.attach(audioRef.current);
      return () => {
        audioTrack.detach();
      };
    }
  }, [audioTracks]);

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-dark/90 ${
        isLocal
          ? "w-40 h-28 shadow-lg border-2 border-white/20"
          : "w-full h-full"
      }`}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal}
        className="w-full h-full object-cover"
      />
      <audio ref={audioRef} autoPlay muted={isLocal} />

      {/* Participant name badge */}
      <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-lg font-medium">
        {isLocal ? "Vous" : participant.identity}
      </div>
    </div>
  );
}
