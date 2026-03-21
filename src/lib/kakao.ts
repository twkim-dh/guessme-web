declare global {
  interface Window {
    Kakao: {
      init: (key: string) => void;
      isInitialized: () => boolean;
      Share: {
        sendDefault: (params: KakaoShareParams) => void;
      };
    };
  }
}

interface KakaoShareParams {
  objectType: "feed";
  content: {
    title: string;
    description: string;
    imageUrl: string;
    link: {
      mobileWebUrl: string;
      webUrl: string;
    };
  };
  buttons: Array<{
    title: string;
    link: {
      mobileWebUrl: string;
      webUrl: string;
    };
  }>;
}

const DOMAIN = "https://guessme.dhlm-studio.com";

function isKakaoAvailable(): boolean {
  return typeof window !== "undefined" && !!window.Kakao;
}

export function initKakao(): void {
  const kakaoKey =
    process.env.NEXT_PUBLIC_KAKAO_JS_KEY || "ea95354167038ebb0be11c1aae1ffe26";

  function tryInit() {
    if (typeof window === "undefined") return;
    if (!window.Kakao) {
      console.log("[Kakao] SDK not yet loaded, retrying in 500ms...");
      setTimeout(tryInit, 500);
      return;
    }
    if (!window.Kakao.isInitialized()) {
      window.Kakao.init(kakaoKey);
      console.log("[Kakao] SDK initialized.");
    } else {
      console.log("[Kakao] Already initialized.");
    }
  }

  tryInit();
}

export async function shareQuiz(shareCode: string): Promise<void> {
  const shareUrl = `${DOMAIN}/s/${shareCode}`;
  const shareData = {
    title: "나를 맞춰봐! \uD83C\uDFAF",
    text: "나에 대해 얼마나 알고 있는지 맞춰보세요!",
    url: shareUrl,
  };

  if (navigator.share) {
    try {
      await navigator.share(shareData);
      return;
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
    }
  }

  if (isKakaoAvailable() && window.Kakao.isInitialized()) {
    const params: KakaoShareParams = {
      objectType: "feed",
      content: {
        title: shareData.title,
        description: shareData.text,
        imageUrl: `${DOMAIN}/og-image.png`,
        link: {
          mobileWebUrl: shareUrl,
          webUrl: shareUrl,
        },
      },
      buttons: [
        {
          title: "맞춰보기",
          link: {
            mobileWebUrl: shareUrl,
            webUrl: shareUrl,
          },
        },
      ],
    };
    window.Kakao.Share.sendDefault(params);
  } else {
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert("링크가 복사되었습니다! 카카오톡에 붙여넣기 해주세요.");
    } catch {
      prompt("아래 링크를 복사해주세요:", shareUrl);
    }
  }
}

export async function shareResult(
  correctCount: number,
  total: number,
  sessionId: string,
  guesserId: string
): Promise<void> {
  const resultUrl = `${DOMAIN}/result/${sessionId}?gid=${guesserId}`;
  const shareData = {
    title: `${correctCount}/${total} 맞춤! \uD83C\uDF89`,
    text: "나를 맞춰봐! 결과를 확인해보세요!",
    url: resultUrl,
  };

  if (navigator.share) {
    try {
      await navigator.share(shareData);
      return;
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
    }
  }

  if (isKakaoAvailable() && window.Kakao.isInitialized()) {
    const params: KakaoShareParams = {
      objectType: "feed",
      content: {
        title: shareData.title,
        description: shareData.text,
        imageUrl: `${DOMAIN}/og-image.png`,
        link: {
          mobileWebUrl: resultUrl,
          webUrl: resultUrl,
        },
      },
      buttons: [
        {
          title: "결과 보기",
          link: {
            mobileWebUrl: resultUrl,
            webUrl: resultUrl,
          },
        },
        {
          title: "나도 해보기",
          link: {
            mobileWebUrl: DOMAIN,
            webUrl: DOMAIN,
          },
        },
      ],
    };
    window.Kakao.Share.sendDefault(params);
  } else {
    try {
      await navigator.clipboard.writeText(resultUrl);
      alert("링크가 복사되었습니다! 카카오톡에 붙여넣기 해주세요.");
    } catch {
      prompt("아래 링크를 복사해주세요:", resultUrl);
    }
  }
}
