"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function HomePage() {
  const router = useRouter();
  const [name, setName] = useState("");

  const handleStart = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      alert("이름을 입력해주세요!");
      return;
    }
    const encoded = encodeURIComponent(trimmed);
    router.push(`/play?name=${encoded}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-12">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <div className="text-7xl mb-4">{"\uD83C\uDFAF"}</div>
        <h1 className="text-3xl font-extrabold text-white mb-3">
          나를 맞춰봐
        </h1>
        <p className="text-white/80 text-base mb-10 leading-relaxed">
          친구가 나를 얼마나
          <br />잘 아는지 확인해보세요
        </p>
      </motion.div>

      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-full max-w-sm"
      >
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            내 이름 (닉네임)
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleStart()}
            placeholder="예: 민지"
            maxLength={20}
            className="w-full px-4 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-500 focus:outline-none text-gray-800 text-base transition-colors"
          />
          <button
            onClick={handleStart}
            className="w-full mt-4 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold text-lg shadow-lg hover:shadow-xl active:scale-[0.98] transition-all"
          >
            시작하기
          </button>
        </div>
      </motion.div>
    </div>
  );
}
