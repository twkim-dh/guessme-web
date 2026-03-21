"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { nanoid } from "nanoid";
import { questions } from "@/data/questions";
import {
  getSessionByShareCode,
  getAnswers,
  saveAnswers,
  saveGuessResult,
} from "@/lib/firestore-service";
import type { Session } from "@/types";

type Phase = "loading" | "intro" | "nickname" | "quiz" | "saving" | "error";

export default function GuesserPage() {
  const params = useParams();
  const router = useRouter();
  const shareCode = params.shareCode as string;

  const [phase, setPhase] = useState<Phase>("loading");
  const [session, setSession] = useState<Session | null>(null);
  const [guesserName, setGuesserName] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<
    { questionId: string; selectedOption: string }[]
  >([]);

  useEffect(() => {
    async function load() {
      const s = await getSessionByShareCode(shareCode);
      if (s) {
        setSession(s);
        setPhase("intro");
      } else {
        setPhase("error");
      }
    }
    load();
  }, [shareCode]);

  const handleStartNickname = () => {
    setPhase("nickname");
  };

  const handleStartQuiz = () => {
    const trimmed = guesserName.trim();
    if (!trimmed) {
      alert("닉네임을 입력해주세요!");
      return;
    }
    setPhase("quiz");
  };

  const question = questions[currentIndex];
  const progress = (currentIndex / questions.length) * 100;

  const handleSelect = useCallback(
    async (optionKey: string) => {
      if (phase !== "quiz" || !session) return;

      const newAnswers = [
        ...answers,
        { questionId: question.id, selectedOption: optionKey },
      ];
      setAnswers(newAnswers);

      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        // Last question - compare and save
        setPhase("saving");
        try {
          const guesserId = nanoid();

          // Save guesser answers
          await saveAnswers(
            session.id,
            "guesser",
            newAnswers,
            guesserId,
            guesserName.trim()
          );

          // Get creator answers and compare
          const { creator } = await getAnswers(session.id);
          let correctCount = 0;

          for (const guesserAnswer of newAnswers) {
            const creatorAnswer = creator.find(
              (c) => c.questionId === guesserAnswer.questionId
            );
            if (
              creatorAnswer &&
              creatorAnswer.selectedOption === guesserAnswer.selectedOption
            ) {
              correctCount++;
            }
          }

          // Save result
          await saveGuessResult(
            session.id,
            guesserId,
            guesserName.trim(),
            correctCount,
            questions.length
          );

          router.push(
            `/result/${session.id}?gid=${guesserId}`
          );
        } catch (err) {
          console.error("Save error:", err);
          alert("저장에 실패했습니다. 다시 시도해주세요.");
          setPhase("quiz");
        }
      }
    },
    [answers, currentIndex, phase, session, guesserName, question?.id, router]
  );

  // Loading
  if (phase === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-10 h-10 border-4 border-white border-t-transparent rounded-full" />
      </div>
    );
  }

  // Error
  if (phase === "error") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6">
        <div className="text-5xl mb-4">{"\uD83D\uDE22"}</div>
        <p className="text-white text-lg mb-4">퀴즈를 찾을 수 없습니다</p>
        <button
          onClick={() => router.push("/")}
          className="px-6 py-3 bg-white/90 rounded-xl text-purple-700 font-bold"
        >
          홈으로
        </button>
      </div>
    );
  }

  // Intro
  if (phase === "intro") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6 py-12">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="text-7xl mb-4">{"\uD83C\uDFAF"}</div>
          <h1 className="text-2xl font-extrabold text-white mb-3">
            {session?.creatorName}님을
            <br />
            맞춰보세요!
          </h1>
          <p className="text-white/80 text-base">
            10가지 질문에 답해서
            <br />
            얼마나 잘 아는지 확인해보세요
          </p>
        </motion.div>
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <button
            onClick={handleStartNickname}
            className="px-10 py-4 rounded-xl bg-white/95 text-purple-700 font-bold text-lg shadow-xl hover:shadow-2xl active:scale-[0.98] transition-all"
          >
            시작하기
          </button>
        </motion.div>
      </div>
    );
  }

  // Nickname
  if (phase === "nickname") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6 py-12">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm"
        >
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-bold text-gray-800 mb-4 text-center">
              내 닉네임 입력
            </h2>
            <input
              type="text"
              value={guesserName}
              onChange={(e) => setGuesserName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleStartQuiz()}
              placeholder="예: 수진"
              maxLength={20}
              className="w-full px-4 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-500 focus:outline-none text-gray-800 text-base transition-colors"
              autoFocus
            />
            <button
              onClick={handleStartQuiz}
              className="w-full mt-4 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold text-lg shadow-lg active:scale-[0.98] transition-all"
            >
              맞춰보기 시작!
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Saving
  if (phase === "saving") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-white rounded-2xl p-8 text-center shadow-2xl">
          <div className="animate-spin w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-700 font-medium">결과 계산 중...</p>
        </div>
      </div>
    );
  }

  // Quiz
  return (
    <div className="flex flex-col min-h-screen px-6 py-8">
      {/* Progress */}
      <div className="mb-2 flex items-center justify-between">
        <span className="text-white/80 text-sm font-medium">
          {currentIndex + 1} / {questions.length}
        </span>
        <span className="text-white/60 text-sm">
          {session?.creatorName}님을 맞춰보세요
        </span>
      </div>
      <div className="w-full h-2 bg-white/20 rounded-full mb-8 overflow-hidden">
        <div
          className="h-full bg-white rounded-full progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -50, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="flex-1 flex flex-col"
        >
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl mb-6">
            <h2 className="text-xl font-bold text-gray-800 leading-relaxed">
              Q{currentIndex + 1}. {session?.creatorName}님의{" "}
              {question.text}
            </h2>
          </div>

          <div className="space-y-3">
            {question.options.map((option) => (
              <button
                key={option.key}
                onClick={() => handleSelect(option.key)}
                className="option-btn w-full py-4 px-5 bg-white/90 backdrop-blur-sm rounded-xl text-left font-medium text-gray-800 shadow-md hover:bg-white hover:shadow-lg active:bg-pink-50 transition-all"
              >
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-bold mr-3">
                  {option.key}
                </span>
                {option.label}
              </button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
