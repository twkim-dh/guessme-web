"use client";

import { Suspense, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { nanoid } from "nanoid";
import { questions } from "@/data/questions";
import { createSession, saveAnswers } from "@/lib/firestore-service";

function PlayContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const creatorName = searchParams.get("name") || "";

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<
    { questionId: string; selectedOption: string }[]
  >([]);
  const [saving, setSaving] = useState(false);

  const question = questions[currentIndex];
  const progress = (currentIndex / questions.length) * 100;

  const handleSelect = useCallback(
    async (optionKey: string) => {
      if (saving) return;

      const newAnswers = [
        ...answers,
        { questionId: question.id, selectedOption: optionKey },
      ];
      setAnswers(newAnswers);

      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setSaving(true);
        try {
          const creatorId = nanoid();
          const session = await createSession(creatorId, creatorName);
          await saveAnswers(session.id, "creator", newAnswers);
          router.push(`/share/${session.id}`);
        } catch (err) {
          console.error("Save error:", err);
          alert("저장에 실패했습니다. 다시 시도해주세요.");
          setSaving(false);
        }
      }
    },
    [answers, currentIndex, saving, creatorName, question.id, router]
  );

  if (!creatorName) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6">
        <p className="text-white text-lg mb-4">이름이 필요합니다</p>
        <button
          onClick={() => router.push("/")}
          className="px-6 py-3 bg-white/90 rounded-xl text-purple-700 font-bold"
        >
          홈으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen px-6 py-8">
      {/* Progress */}
      <div className="mb-2 flex items-center justify-between">
        <span className="text-white/80 text-sm font-medium">
          {currentIndex + 1} / {questions.length}
        </span>
        <span className="text-white/60 text-sm">{creatorName}님의 답변</span>
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
              Q{currentIndex + 1}. {question.text}
            </h2>
          </div>

          <div className="space-y-3">
            {question.options.map((option) => (
              <button
                key={option.key}
                onClick={() => handleSelect(option.key)}
                disabled={saving}
                className="option-btn w-full py-4 px-5 bg-white/90 backdrop-blur-sm rounded-xl text-left font-medium text-gray-800 shadow-md hover:bg-white hover:shadow-lg active:bg-purple-50 disabled:opacity-50 transition-all"
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

      {saving && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 text-center shadow-2xl">
            <div className="animate-spin w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-700 font-medium">저장 중...</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PlayPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin w-10 h-10 border-4 border-white border-t-transparent rounded-full" />
        </div>
      }
    >
      <PlayContent />
    </Suspense>
  );
}
