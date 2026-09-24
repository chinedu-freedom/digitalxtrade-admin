'use client';

export default function PageLoader() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050d1a] backdrop-blur-md">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-12 h-12 text-[#0085d0]"
        viewBox="0 0 24 24"
      >
        <path d="M0 0h24v24H0z" fill="none" />
        <rect width="6" height="14" x="1" y="4" fill="currentColor">
          <animate id="SVG9ovaHbIP" fill="freeze" attributeName="opacity" begin="0;SVGa89dAd4w.end-0.25s" dur="0.75s" values="1;.2" />
        </rect>
        <rect width="6" height="14" x="9" y="4" fill="currentColor" opacity=".4">
          <animate fill="freeze" attributeName="opacity" begin="SVG9ovaHbIP.begin+0.15s" dur="0.75s" values="1;.2" />
        </rect>
        <rect width="6" height="14" x="17" y="4" fill="currentColor" opacity=".3">
          <animate id="SVGa89dAd4w" fill="freeze" attributeName="opacity" begin="SVG9ovaHbIP.begin+0.3s" dur="0.75s" values="1;.2" />
        </rect>
      </svg>
    </div>
  );
}
