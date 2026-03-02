"use client";

import React, { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useConversations } from "@/services/messages/getConversations";
import { useConversation } from "@/services/messages/getConversation";
import { useSendMessage } from "@/services/messages/sendMessage";
import { useMarkConversationRead } from "@/services/messages/markConversationRead";
import dayjs from "dayjs";
import "dayjs/locale/fr";
import relativeTime from "dayjs/plugin/relativeTime";
import { MessageCircleMore, Send, ArrowLeft } from "lucide-react";
import type { ConversationListItem } from "@/schemas/conversation";

dayjs.locale("fr");
dayjs.extend(relativeTime);

import Image from "next/image";

function getInitials(firstName?: string | null, lastName?: string | null) {
  return (
    (firstName?.charAt(0).toUpperCase() ?? "") +
    (lastName?.charAt(0).toUpperCase() ?? "")
  );
}

function getCorrespondentName(
  conv: ConversationListItem,
  userId: string | undefined,
  isGuide: boolean,
): string {
  if (isGuide) {
    const u = conv.booking?.user;
    return u ? `${u.first_name} ${u.last_name}` : "Voyageur";
  }
  const g = conv.booking?.experience?.guide?.user;
  return g ? `${g.first_name} ${g.last_name}` : "Guide";
}

function getGuideProfilePicture(
  conv: ConversationListItem,
  isGuide: boolean,
): string | null {
  if (isGuide) return null; // We only show guide pictures to users

  const medias = conv.booking?.experience?.guide?.medias;
  if (!medias || !Array.isArray(medias)) return null;

  const profilePic = medias.find((m) => m.media_type === "profile_picture");
  return profilePic ? profilePic.url : null;
}

function getExperienceTitle(conv: ConversationListItem): string {
  return conv.booking?.experience?.title ?? "Expérience";
}

function getLastMessagePreview(conv: ConversationListItem): {
  text: string;
  date: string | null;
  timestamp: number;
} {
  const msgs = conv.messages ?? [];
  if (msgs.length === 0) {
    return {
      text: "Aucun message",
      date: null,
      timestamp: new Date(conv.created_at).getTime(),
    };
  }
  const last = msgs[msgs.length - 1];
  return {
    text:
      last.content.length > 60 ? last.content.slice(0, 60) + "…" : last.content,
    date: dayjs(last.sent_at).fromNow(),
    timestamp: new Date(last.sent_at).getTime(),
  };
}

// ─── Sub-components ─────────────────────────────────────────────────────────

interface ConversationCardProps {
  conv: ConversationListItem;
  isSelected: boolean;
  userId: string | undefined;
  isGuide: boolean;
  onClick: () => void;
}

function ConversationCard({
  conv,
  isSelected,
  userId,
  isGuide,
  onClick,
}: ConversationCardProps) {
  const name = getCorrespondentName(conv, userId, isGuide);
  const title = getExperienceTitle(conv);
  const { text, date } = getLastMessagePreview(conv);
  const profilePic = getGuideProfilePicture(conv, isGuide);
  const hasUnread = conv.messages?.some(
    (m) => !m.is_read && m.author_id !== userId,
  );

  const initials = name
    .split(" ")
    .map((p) => p.charAt(0).toUpperCase())
    .join("")
    .slice(0, 2);

  return (
    <button
      onClick={onClick}
      className={`w-full bg-white text-left flex items-start gap-3 px-4 py-4 rounded-xl transition cursor-pointer border my-2 ${
        isSelected
          ? "bg-accent/10 border-accent/30"
          : "border-transparent hover:bg-gray-light/40"
      }`}
    >
      {/* Avatar */}
      <div
        className={`relative w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 overflow-hidden ${
          isSelected ? "bg-accent text-white" : "bg-primary/10 text-primary"
        }`}
      >
        {profilePic ? (
          <Image
            src={profilePic}
            alt={name}
            fill
            sizes="40px"
            className="object-cover"
          />
        ) : (
          initials
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p
            className={`text-sm truncate ${isSelected ? "text-accent font-semibold" : hasUnread ? "text-dark font-bold" : "text-dark font-semibold"}`}
          >
            {name}
          </p>
          {date && (
            <span
              className={`text-xs whitespace-nowrap ${hasUnread ? "text-dark font-bold" : "text-dark/40"}`}
            >
              {date}
            </span>
          )}
        </div>
        <p
          className={`text-xs truncate mt-0.5 ${hasUnread ? "text-dark font-semibold" : "text-dark/60 font-normal"}`}
        >
          {title}
        </p>
        <p
          className={`text-xs truncate mt-1 ${hasUnread ? "text-dark font-bold" : "text-dark/50 font-normal"}`}
        >
          {text}
        </p>
      </div>
    </button>
  );
}

// ─── Chat panel ──────────────────────────────────────────────────────────────

interface ChatPanelProps {
  conversationId: string;
  currentUserId: string;
  isGuide: boolean;
}

function ChatPanel({ conversationId, currentUserId, isGuide }: ChatPanelProps) {
  const { data: conv, isLoading } = useConversation(conversationId);
  const { mutate: send, isPending: isSending } = useSendMessage(conversationId);
  const { mutate: markRead } = useMarkConversationRead();
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isUserScrollingRef = useRef(false);

  // Mark conversation as read on mount/update if there are unread messages
  useEffect(() => {
    if (conv?.messages) {
      const hasUnread = conv.messages.some(
        (m) => !m.is_read && m.author_id !== currentUserId,
      );
      if (hasUnread) {
        markRead(conversationId);
      }
    }
  }, [conv?.messages, conversationId, currentUserId, markRead]);

  // Check if user is scrolled near the bottom (within 100px)
  const isNearBottom = () => {
    const container = scrollContainerRef.current;
    if (!container) return true;
    return (
      container.scrollTop + container.clientHeight >=
      container.scrollHeight - 100
    );
  };

  // Handle manual scroll events
  const handleScroll = () => {
    if (!isNearBottom()) {
      isUserScrollingRef.current = true;
    } else {
      isUserScrollingRef.current = false;
    }
  };

  // Auto-scroll to bottom only when near the bottom or sending a message
  useEffect(() => {
    if (!isUserScrollingRef.current && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [conv?.messages]);

  const handleSend = () => {
    const content = draft.trim();
    if (!content || isSending) return;

    // Force scroll to bottom on own send
    isUserScrollingRef.current = false;

    send(
      { conversation_id: conversationId, author_id: currentUserId, content },
      { onSuccess: () => setDraft("") },
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-dark/40 text-sm">Chargement des messages…</p>
      </div>
    );
  }

  if (!conv) return null;

  const correspondentName = isGuide
    ? conv.booking?.user
      ? `${conv.booking.user.first_name} ${conv.booking.user.last_name}`
      : "Voyageur"
    : conv.booking?.experience?.guide?.user
      ? `${conv.booking.experience.guide.user.first_name} ${conv.booking.experience.guide.user.last_name}`
      : "Guide";

  const experienceTitle = conv.booking?.experience?.title ?? "Expérience";
  const bookingDate = conv.booking?.booking_date
    ? dayjs(conv.booking.booking_date).format("D MMMM YYYY")
    : null;
  const totalPrice = conv.booking?.total_price;
  const bookingStatus = conv.booking?.status;

  const getStatusDisplay = (status?: string) => {
    switch (status) {
      case "PENDING":
        return {
          text: "En attente de confirmation",
          color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
        };
      case "ACCEPTED":
        return {
          text: "Réservation acceptée",
          color: "bg-green-500/10 text-green-600 border-green-500/20",
        };
      case "REJECTED":
        return {
          text: "Réservation refusée",
          color: "bg-red-500/10 text-red-600 border-red-500/20",
        };
      case "CANCELLED":
        return {
          text: "Réservation annulée",
          color: "bg-red-500/10 text-red-600 border-red-500/20",
        };
      case "COMPLETED":
        return {
          text: "Expérience terminée",
          color: "bg-blue-500/10 text-blue-600 border-blue-500/20",
        };
      default:
        return null;
    }
  };

  const statusDisplay = getStatusDisplay(bookingStatus);

  return (
    <div className="flex flex-col h-full bg-white border border-black/10 rounded-xl">
      {/* Header */}
      <div className="px-6 py-4 border-b border-dark/10 shrink-0">
        <p className="font-semibold text-dark">{correspondentName}</p>
        <p className="text-xs text-dark/50 font-normal mt-0.5">
          {experienceTitle}
        </p>
      </div>

      {/* Messages */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-3"
      >
        {conv.messages.length === 0 && (
          <p className="text-center text-dark/40 text-sm mt-12 mb-4">
            Commencez la discussion !
          </p>
        )}

        {/* System Message for Booking Request */}
        <div className="flex justify-center w-full my-4">
          <div className="bg-gray-light/60 text-dark/70 text-sm px-5 py-3 rounded-2xl text-center max-w-[80%] border border-dark/5 shadow-sm">
            <p className="font-semibold text-dark mb-1">
              Demande de réservation
            </p>
            <p className="text-[13px]">
              Expérience :{" "}
              <span className="font-medium text-dark">{experienceTitle}</span>
            </p>
            {conv.booking?.number_of_participants ? (
              <p className="text-[13px]">
                Pour {conv.booking.number_of_participants} participant
                {conv.booking.number_of_participants > 1 ? "s" : ""}
              </p>
            ) : null}
            {bookingDate && (
              <p className="text-[13px]">
                Date prévue :{" "}
                <span className="font-medium text-dark">{bookingDate}</span>
              </p>
            )}
            {totalPrice !== undefined && totalPrice !== null && (
              <p className="text-[13px]">
                Prix total :{" "}
                <span className="font-medium text-dark">{totalPrice} €</span>
              </p>
            )}
            <p className="text-[11px] text-dark/40 mt-2">
              {dayjs(conv.created_at).format("D MMM, HH:mm")}
            </p>
          </div>
        </div>
        {conv.messages.map((msg) => {
          const isMine = msg.author_id === currentUserId;
          return (
            <div
              key={msg.id}
              className={`flex flex-col max-w-[70%] gap-1 ${isMine ? "self-end items-end" : "self-start items-start"}`}
            >
              {!isMine && msg.author && (
                <p className="text-[11px] text-dark/50 px-1">
                  {msg.author.first_name} {msg.author.last_name}
                </p>
              )}
              <div
                className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  isMine
                    ? "bg-accent text-white rounded-br-sm"
                    : "bg-gray-light/60 text-dark rounded-bl-sm"
                }`}
              >
                {msg.content}
              </div>
              <p className="text-[11px] text-dark/40 px-1">
                {dayjs(msg.sent_at).format("D MMM, HH:mm")}
              </p>
            </div>
          );
        })}

        {/* Global Booking Status (Displayed at the end) */}
        {statusDisplay && (
          <div className="flex justify-center w-full my-4">
            <div
              className={`text-xs px-4 py-2 rounded-full border ${statusDisplay.color}`}
            >
              {statusDisplay.text}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-6 py-4 border-t border-dark/10 shrink-0">
        <div className="flex items-end gap-3 bg-gray-light/30 rounded-2xl p-2 border border-dark/10 focus-within:border-accent transition">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Écrivez votre message… (Entrée pour envoyer)"
            rows={2}
            className="flex-1 border-none resize-none bg-transparent text-sm text-dark placeholder:text-dark/40 outline-none leading-relaxed"
          />
          <button
            onClick={handleSend}
            disabled={!draft.trim() || isSending}
            className="flex p-1 items-center justify-center w-9 h-9 rounded-xl bg-accent text-white shrink-0 transition hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────

export default function MessagesPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const isGuide = session?.user?.role === "guide";

  const { data: conversations, isLoading, error } = useConversations();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mobileShowChat, setMobileShowChat] = useState(false);

  // Filter and sort conversations
  const myConversations = (
    conversations?.filter((conv) => {
      if (!userId) return false;
      if (isGuide) {
        const guideUser = conv.booking?.experience?.guide?.user;
        return guideUser?.id === userId;
      }
      return conv.booking?.user?.id === userId;
    }) ?? []
  ).sort((a, b) => {
    const timestampA = getLastMessagePreview(a).timestamp;
    const timestampB = getLastMessagePreview(b).timestamp;
    return timestampB - timestampA;
  });

  const handleSelectConversation = (id: string) => {
    setSelectedId(id);
    setMobileShowChat(true);
  };

  return (
    <div>
      {/* Chat container */}
      <div
        className="flex mt-8 overflow-hidden"
        style={{ height: "calc(100vh - 280px)", minHeight: "500px" }}
      >
        {/* Left sidebar — conversation list */}
        <div
          className={`w-80 shrink-0 flex flex-col ${
            mobileShowChat ? "hidden md:flex" : "flex"
          }`}
        >
          {/* Sidebar header */}
          <div className="px-4 py-4">
            <h1 className="text-3xl font-extrabold text-dark !text-left mb-1">
              Messagerie
            </h1>
            <p className="text-sm font-semibold text-dark flex items-center gap-2">
              <MessageCircleMore size={16} className="text-accent" />
              {myConversations.length} conversation
              {myConversations.length !== 1 ? "s" : ""}
            </p>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-2">
            {isLoading && (
              <p className="text-dark/40 text-sm text-center mt-8">
                Chargement…
              </p>
            )}
            {error && (
              <p className="text-red-500 text-sm text-center mt-8">
                Erreur lors du chargement.
              </p>
            )}
            {!isLoading && !error && myConversations.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full gap-3 px-4 mt-16 text-center">
                <MessageCircleMore size={40} className="text-dark/20" />
                <p className="text-dark/40 text-sm">
                  Aucune conversation pour le moment.
                </p>
                <p className="text-dark/30 text-xs">
                  Les conversations sont créées automatiquement lors des
                  réservations.
                </p>
              </div>
            )}
            {myConversations.map((conv) => (
              <ConversationCard
                key={conv.id}
                conv={conv}
                isSelected={selectedId === conv.id}
                userId={userId}
                isGuide={isGuide}
                onClick={() => handleSelectConversation(conv.id)}
              />
            ))}
          </div>
        </div>

        {/* Right panel — chat */}
        <div
          className={`flex-1 flex flex-col ${
            !mobileShowChat && !selectedId ? "hidden md:flex" : "flex"
          }`}
        >
          {/* Mobile back button */}
          {mobileShowChat && (
            <button
              onClick={() => setMobileShowChat(false)}
              className="md:hidden bg-white w-fit flex items-center gap-2 px-4 py-3 text-sm text-dark/60 border-b border-dark/10"
            >
              <ArrowLeft size={16} />
              Retour aux conversations
            </button>
          )}

          {!selectedId ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-8 gap-4">
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
                <MessageCircleMore size={28} className="text-accent" />
              </div>
              <p className="text-dark font-semibold">
                Sélectionnez une conversation
              </p>
              <p className="text-dark/40 text-sm max-w-xs">
                Choisissez une conversation dans la liste pour afficher
                l'échange.
              </p>
            </div>
          ) : (
            userId && (
              <ChatPanel
                conversationId={selectedId}
                currentUserId={userId}
                isGuide={isGuide}
              />
            )
          )}
        </div>
      </div>
    </div>
  );
}
