"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import type { Bubble } from "@/utils/config/bubbles.config";

export function FloatingBubble(bubble: Bubble) {
  return (
    <motion.div
      className="absolute rounded-full flex items-center justify-center text-center"
      style={{
        width: bubble.size,
        height: bubble.size,
        top: bubble.top,
        left: bubble.left,
        backgroundColor: bubble.type === "text" ? bubble.bgColor : undefined,
        color: bubble.type === "text" ? bubble.textColor ?? "#fff" : undefined,
      }}
      animate={{
        y: [0, -bubble.float, 0],
        x: [0, bubble.float / 2, 0],
      }}
      transition={{
        duration: 6 + Math.random() * 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {bubble.type === "image" ? (
        <Image
          src={bubble.src}
          alt=""
          fill
          className="object-cover rounded-full"
          sizes={`${bubble.size}px`}
        />
      ) : (
        <div className="px-2 leading-tight">
          <div className="text-2xl font-bold">{bubble.label}</div>
          {bubble.value && (
            <div className="text-xs whitespace-pre-line">{bubble.value}</div>
          )}
        </div>
      )}
    </motion.div>
  );
}
