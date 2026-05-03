import { useEffect, useRef } from "react";

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const ftopRef   = useRef<HTMLDivElement>(null);
  const fbotRef   = useRef<HTMLDivElement>(null);
  const mWrapRef  = useRef<HTMLDivElement>(null);
  const flashRef  = useRef<HTMLDivElement>(null);
  const logoRef   = useRef<HTMLDivElement>(null);
  const ulineRef  = useRef<HTMLDivElement>(null);
  const taglineRef= useRef<HTMLDivElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const lfRef     = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Film holes
    [ftopRef.current, fbotRef.current].forEach((el) => {
      if (!el) return;
      for (let i = 0; i < 22; i++) {
        const h = document.createElement("div");
        h.className = "mf-fh";
        el.appendChild(h);
      }
    });

    const ZOOM_DURATION = 1400;
    const TARGET_SCALE  = 45;
    const START_DELAY   = 400;

    function easeIn(t: number) { return t * t * t; }

    let startTime: number | null = null;
    let rafId: number;

    function animateZoom(ts: number) {
      if (!startTime) startTime = ts;
      const elapsed  = ts - startTime;
      const progress = Math.min(elapsed / ZOOM_DURATION, 1);
      const eased    = easeIn(progress);
      const scale    = 1 + (TARGET_SCALE - 1) * eased;
      const opacity  = progress < 0.85 ? 1 : 1 - (progress - 0.85) / 0.15;

      if (mWrapRef.current) {
        mWrapRef.current.style.transform = `scale(${scale})`;
        mWrapRef.current.style.opacity   = String(opacity);
      }

      if (progress < 1) {
        rafId = requestAnimationFrame(animateZoom);
      } else {
        if (mWrapRef.current) mWrapRef.current.style.opacity = "0";
        doFlash();
      }
    }

    function doFlash() {
      const f = flashRef.current;
      if (!f) return;
      f.style.transition = "opacity 0.15s ease-in";
      f.style.opacity = "1";
      setTimeout(() => {
        f.style.transition = "opacity 0.2s ease-out";
        f.style.opacity = "0";
        setTimeout(showLogo, 200);
      }, 150);
    }

    function showLogo() {
      if (logoRef.current)    logoRef.current.style.opacity    = "1";
      if (loaderRef.current)  loaderRef.current.style.opacity  = "1";
      setTimeout(() => { if (lfRef.current)      lfRef.current.style.width        = "100%"; }, 100);
      setTimeout(() => { if (ulineRef.current)   ulineRef.current.style.width     = "100%"; }, 600);
      setTimeout(() => { if (taglineRef.current) taglineRef.current.style.opacity = "1";    }, 900);
      setTimeout(() => { onComplete(); }, 2800);
    }

    const t = setTimeout(() => {
      rafId = requestAnimationFrame(animateZoom);
    }, START_DELAY);

    return () => {
      clearTimeout(t);
      cancelAnimationFrame(rafId);
    };
  }, [onComplete]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,800;1,400&display=swap');

        .mf-splash {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .mf-film {
          position: absolute;
          left: 0; right: 0;
          height: 28px;
          background: #111;
          z-index: 100;
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 0 6px;
        }
        .mf-film.top { top: 0; }
        .mf-film.bot { bottom: 0; }
        .mf-fh {
          width: 16px;
          height: 12px;
          background: #fff;
          border-radius: 2px;
          flex-shrink: 0;
        }

        .mf-m-wrap {
          position: absolute;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: center;
          transform-origin: 50% 50%;
          will-change: transform, opacity;
        }
        .mf-m-letter {
          font-family: 'Cormorant Garamond', serif;
          font-size: 140px;
          font-weight: 800;
          color: #E8322A;
          line-height: 1;
          user-select: none;
          will-change: transform;
        }

        .mf-flash {
          position: absolute;
          inset: 0;
          z-index: 9;
          background: #E8322A;
          opacity: 0;
          pointer-events: none;
        }

        .mf-logo-wrap {
          position: absolute;
          z-index: 99;
          display: flex;
          flex-direction: column;
          align-items: center;
          opacity: 0;
          transition: opacity 0.8s ease;
        }
        .mf-logo {
          font-family: 'Cormorant Garamond', serif;
          font-size: 58px;
          font-weight: 800;
          color: #111;
          letter-spacing: 3px;
          line-height: 1;
        }
        .mf-flix {
          color: #E8322A;
          font-style: italic;
          font-weight: 400;
        }

        .mf-uline {
          height: 2px;
          width: 0;
          background: linear-gradient(90deg, #111, #E8322A);
          margin-top: 10px;
          border-radius: 2px;
          transition: width 0.7s ease;
        }

        .mf-tagline {
          font-family: 'Cormorant Garamond', serif;
          font-size: 11px;
          font-style: italic;
          color: #111;
          letter-spacing: 6px;
          margin-top: 14px;
          opacity: 0;
          transition: opacity 0.8s ease;
        }

        .mf-loader {
          position: absolute;
          bottom: 28px;
          left: 0; right: 0;
          height: 2px;
          background: rgba(0, 0, 0, 0.08);
          z-index: 101;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .mf-lf {
          height: 100%;
          width: 0;
          background: #E8322A;
          transition: width 1.5s ease;
        }
      `}</style>

      <div className="mf-splash">
        <div className="mf-film top" ref={ftopRef} />
        <div className="mf-film bot" ref={fbotRef} />

        <div className="mf-flash" ref={flashRef} />

        <div className="mf-m-wrap" ref={mWrapRef}>
          <div className="mf-m-letter">M</div>
        </div>

        <div className="mf-logo-wrap" ref={logoRef}>
          <div className="mf-logo">
            MOOD<span className="mf-flix">flix</span>
          </div>
          <div className="mf-uline" ref={ulineRef} />
          <div className="mf-tagline" ref={taglineRef}>feel the scene</div>
        </div>

        <div className="mf-loader" ref={loaderRef}>
          <div className="mf-lf" ref={lfRef} />
        </div>
      </div>
    </>
  );
};

export default SplashScreen;