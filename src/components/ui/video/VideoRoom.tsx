"use client";

import React, { useState, useEffect, useCallback } from "react";
import Video, { Room, RemoteParticipant } from "twilio-video";
import VideoParticipant from "./VideoParticipant";

interface VideoRoomProps {
  roomName: string;
  token: string;
  onDisconnect: () => void;
}

export default function VideoRoom({
  roomName,
  token,
  onDisconnect,
}: VideoRoomProps) {
  const [room, setRoom] = useState<Room | null>(null);
  const [participants, setParticipants] = useState<RemoteParticipant[]>([]);

  const handleDisconnect = useCallback(() => {
    setRoom((currentRoom) => {
      if (currentRoom && currentRoom.localParticipant.state === "connected") {
        currentRoom.localParticipant.tracks.forEach((trackPublication) => {
          if (
            trackPublication.track.kind === "audio" ||
            trackPublication.track.kind === "video"
          ) {
            trackPublication.track.stop();
          }
        });
        currentRoom.disconnect();
        return null;
      }
      return currentRoom;
    });
    onDisconnect();
  }, [onDisconnect]);

  useEffect(() => {
    const participantConnected = (participant: RemoteParticipant) => {
      setParticipants((prev) => [...prev, participant]);
    };

    const participantDisconnected = (participant: RemoteParticipant) => {
      setParticipants((prev) => prev.filter((p) => p !== participant));
    };

    Video.connect(token, {
      name: roomName,
    }).then((connectedRoom) => {
      setRoom(connectedRoom);
      connectedRoom.on("participantConnected", participantConnected);
      connectedRoom.on("participantDisconnected", participantDisconnected);
      connectedRoom.participants.forEach(participantConnected);
    });

    return () => {
      setRoom((currentRoom) => {
        if (currentRoom && currentRoom.localParticipant.state === "connected") {
          currentRoom.localParticipant.tracks.forEach((trackPublication) => {
            if (
              trackPublication.track.kind === "audio" ||
              trackPublication.track.kind === "video"
            ) {
              trackPublication.track.stop();
            }
          });
          currentRoom.disconnect();
          return null;
        }
        return currentRoom;
      });
    };
  }, [roomName, token]);

  return (
    <div className="flex flex-col w-full h-full">
      {/* Remote participants grid */}
      <div className="flex-1 relative flex items-center justify-center bg-dark/95 rounded-2xl overflow-hidden">
        {participants.length === 0 && (
          <div className="flex flex-col items-center gap-3 text-white/60">
            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center animate-pulse">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <p className="text-sm font-medium">En attente des participants…</p>
            <p className="text-xs text-white/40">
              Salon : {roomName.slice(0, 8)}…
            </p>
          </div>
        )}

        {participants.map((participant) => (
          <VideoParticipant key={participant.sid} participant={participant} />
        ))}

        {/* Local participant PiP */}
        {room && (
          <div className="absolute bottom-4 right-4 z-10">
            <VideoParticipant participant={room.localParticipant} isLocal />
          </div>
        )}
      </div>
    </div>
  );
}
