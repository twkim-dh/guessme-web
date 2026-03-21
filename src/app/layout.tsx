import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const notoSansKr = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "나를 맞춰봐 - 친구가 나를 얼마나 잘 알까?",
  description:
    "10가지 질문으로 친구가 나를 얼마나 잘 아는지 확인해보세요!",
  openGraph: {
    title: "나를 맞춰봐 - 친구가 나를 얼마나 잘 알까?",
    description:
      "10가지 질문으로 친구가 나를 얼마나 잘 아는지 확인해보세요!",
    type: "website",
    locale: "ko_KR",
    siteName: "나를 맞춰봐",
    url: "https://guessme.dhlm-studio.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "나를 맞춰봐 - 친구가 나를 얼마나 잘 알까?",
    description:
      "10가지 질문으로 친구가 나를 얼마나 잘 아는지 확인해보세요!",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${notoSansKr.variable} antialiased min-h-screen`}
      >
        <div className="mx-auto w-full max-w-[480px] min-h-screen">
          {children}
        </div>
        <Script
          src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.7/kakao.min.js"
          integrity="sha384-tJkjbtDbvoxO+diRuDtwRO9JXR7pjWnfjfRn5ePUpl7e7RJCxKCwwnfqUAdXh53p"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
