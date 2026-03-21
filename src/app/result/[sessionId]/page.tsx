"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { questions } from "@/data/questions";
import { getGuessResult, getAnswers } from "@/lib/firestore-service";
import { initKakao, shareResult } from "@/lib/kakao";
import type { GuessResult, Answer } from "@/types";

function getBadge(correct: number): { text: string; emoji: string } {
  if (correct >= 9) return { text: "완벽한 텔레파시!", emoji: "\uD83C\uDFAF" };
  if (correct >= 7) return { text: "소울메이트 후보!", emoji: "\uD83D\uDC95" };
  if (correct >= 4) return { text: "꽤 알고 있네요", emoji: "\uD83E\uDD14" };
  return { text: "아직 갈 길이 멀어요", emoji: "\uD83D\uDE05" };
}

function ResultContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;
  const guesserId = searchParams.get("gid") || "";

  const [result, setResult] = useState<GuessResult | null>(null);
  const [creatorAnswers, setCreatorAnswers] = useState<Answer[]>([]);
  const [guesserAnswers, setGuesserAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initKakao();
  }, []);

  useEffect(() => {
    async function load() {
      const [guessResult, answersData] = await Promise.all([
        getGuessResult(sessionId, guesserId || undefined),
        getAnswers(sessionId, guesserId || undefined),
      ]);
      setResult(guessResult);
      setCreatorAnswers(answersData.creator);
      setGuesserAnswers(answersData.guesser);
      setLoading(false);
    }
    load();
  }, [sessionId, guesserId]);

  const handleShareResult = async () => {
    if (!result) return;
    await shareResult(
      result.correctCount,
      result.totalQuestions,
      sessionId,
      guesserId
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-10 h-10 border-4 border-white border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6">
        <p className="text-white text-lg mb-4">결과를 찾을 수 없습니다</p>
        <button
          onClick={() => router.push("/")}
          className="px-6 py-3 bg-white/90 rounded-xl text-purple-700 font-bold"
        >
          홈으로
        </button>
      </div>
    );
  }

  const badge = getBadge(result.correctCount);
  const scorePercent =
    (result.correctCount / result.totalQuestions) * 100;
  const circumference = 2 * Math.PI * 45;
  const dashOffset =
    circumference - (scorePercent / 100) * circumference;

  return (
    <div className="flex flex-col items-center min-h-screen px-6 py-10">
      {/* Score Circle */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative mb-6"
      >
        <svg width="160" height="160" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="8"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="white"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className="score-circle"
            transform="rotate(-90 50 50)"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-extrabold text-white">
            {result.correctCount}/{result.totalQuestions}
          </span>
          <span className="text-white/70 text-sm">맞춤!</span>
        </div>
      </motion.div>

      {/* Badge */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="text-center mb-8"
      >
        <div className="text-4xl mb-2">{badge.emoji}</div>
        <h2 className="text-xl font-bold text-white">{badge.text}</h2>
        <p className="text-white/70 text-sm mt-1">
          {result.guesserName}님의 결과
        </p>
      </motion.div>

      {/* Question Results */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="w-full max-w-sm space-y-3 mb-8"
      >
        {questions.map((q, idx) => {
          const creatorAnswer = creatorAnswers.find(
            (a) => a.questionId === q.id
          );
          const guesserAnswer = guesserAnswers.find(
            (a) => a.questionId === q.id
          );
          const isCorrect =
            creatorAnswer &&
            guesserAnswer &&
            creatorAnswer.selectedOption === guesserAnswer.selectedOption;

          const creatorOption = q.options.find(
            (o) => o.key === creatorAnswer?.selectedOption
          );
          const guesserOption = q.options.find(
            (o) => o.key === guesserAnswer?.selectedOption
          );

          return (
            <div
              key={q.id}
              className={`bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-md ${
                isCorrect ? "ring-2 ring-green-400" : "ring-2 ring-red-300"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-sm font-semibold text-gray-600">
                  Q{idx + 1}. {q.text}
                </span>
                <span className="text-lg ml-2">
                  {isCorrect ? "\u2705" : "\u274C"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-purple-50 rounded-lg px-3 py-2">
                  <div className="text-purple-400 text-xs mb-0.5">정답</div>
                  <div className="font-semibold text-purple-700">
                    {creatorOption?.label || "-"}
                  </div>
                </div>
                <div
                  className={`rounded-lg px-3 py-2 ${
                    isCorrect ? "bg-green-50" : "bg-red-50"
                  }`}
                >
                  <div
                    className={`text-xs mb-0.5 ${
                      isCorrect ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    내 답
                  </div>
                  <div
                    className={`font-semibold ${
                      isCorrect ? "text-green-700" : "text-red-700"
                    }`}
                  >
                    {guesserOption?.label || "-"}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* Action Buttons */}
      <div className="w-full max-w-sm space-y-3 pb-8">
        <button
          onClick={handleShareResult}
          className="w-full py-4 rounded-xl bg-white/95 text-purple-700 font-bold text-lg shadow-lg hover:shadow-xl active:scale-[0.98] transition-all"
        >
          결과 공유하기 {"\uD83D\uDCE2"}
        </button>
        <button
          onClick={() => router.push("/")}
          className="w-full py-4 rounded-xl bg-white/20 text-white font-bold text-lg hover:bg-white/30 active:scale-[0.98] transition-all"
        >
          나도 만들기 {"\u2728"}
        </button>
      </div>
    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin w-10 h-10 border-4 border-white border-t-transparent rounded-full" />
        </div>
      }
    >
      <ResultContent />
    </Suspense>
  );
}
