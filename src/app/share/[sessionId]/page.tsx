"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { getSession } from "@/lib/firestore-service";
import { initKakao, shareQuiz } from "@/lib/kakao";
import type { Session } from "@/types";

export default function SharePage() {
  const params = useParams();
  const sessionId = params.sessionId as string;

  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    initKakao();
  }, []);

  useEffect(() => {
    async function load() {
      const s = await getSession(sessionId);
      setSession(s);
      setLoading(false);
    }
    load();
  }, [sessionId]);

  const handleShare = async () => {
    if (!session) return;
    await shareQuiz(session.shareCode);
  };

  const handleCopyLink = async () => {
    if (!session) return;
    const url = `https://guessme.dhlm-studio.com/s/${session.shareCode}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      prompt("아래 링크를 복사해주세요:", url);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-10 h-10 border-4 border-white border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6">
        <p className="text-white text-lg">세션을 찾을 수 없습니다</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-12">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <div className="text-7xl mb-4">{"\uD83C\uDF89"}</div>
        <h1 className="text-2xl font-extrabold text-white mb-2">
          답변 완료!
        </h1>
        <p className="text-white/80 text-base">
          이제 친구에게 공유해서
          <br />
          나를 얼마나 잘 아는지 확인해보세요
        </p>
      </motion.div>

      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-full max-w-sm space-y-3"
      >
        <button
          onClick={handleShare}
          className="w-full py-4 rounded-xl bg-[#FEE500] text-[#3C1E1E] font-bold text-lg shadow-lg hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 3C6.48 3 2 6.58 2 10.94c0 2.8 1.86 5.27 4.66 6.67-.15.56-.96 3.6-.99 3.83 0 0-.02.17.09.24.11.06.24.01.24.01.32-.04 3.7-2.44 4.28-2.86.56.08 1.13.12 1.72.12 5.52 0 10-3.58 10-7.94S17.52 3 12 3z"
              fill="#3C1E1E"
            />
          </svg>
          카카오톡으로 공유하기
        </button>

        <button
          onClick={handleCopyLink}
          className="w-full py-4 rounded-xl bg-white/90 text-purple-700 font-bold text-lg shadow-lg hover:shadow-xl active:scale-[0.98] transition-all"
        >
          {copied ? "복사됨! \u2705" : "링크 복사하기 \uD83D\uDD17"}
        </button>
      </motion.div>
    </div>
  );
}
