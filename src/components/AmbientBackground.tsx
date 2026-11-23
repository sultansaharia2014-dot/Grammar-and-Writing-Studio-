import { useState } from 'react';

const GHIBLI_SUNSET_SKY_SRC = '/src/assets/images/ghibli_sunset_sky_1795442053229.jpg';

export function AmbientBackground() {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      style={{
        background:
          'linear-gradient(175deg, #6E6591 0%, #B87B95 22%, #E8967A 52%, #F9C48E 78%, #FDE5C0 100%)',
      }}
    >
      {/* Hand-painted Studio Ghibli Sunset Sky & Cozy Hillside */}
      {!imgFailed && (
        <img
          src={GHIBLI_SUNSET_SKY_SRC}
          alt=""
          referrerPolicy="no-referrer"
          onError={() => setImgFailed(true)}
          className="absolute inset-0 h-full w-full object-cover object-center opacity-85 saturate-110"
        />
      )}

      {/* Soft luminous golden-hour atmospheric veil so glass cards stay ultra-readable */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(255, 241, 232, 0.28) 0%, rgba(255, 237, 218, 0.36) 55%, rgba(253, 244, 232, 0.48) 100%)',
        }}
      />

      {/* Drifting Sunset Sunbeam & Twilight Orbs */}
      <div
        className="animate-orb-1 absolute -top-20 left-[12%] h-[420px] w-[420px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(255, 214, 165, 0.72) 0%, rgba(255, 214, 165, 0) 70%)',
          filter: 'blur(70px)',
        }}
      />
      <div
        className="animate-orb-2 absolute top-[18%] -right-24 h-[480px] w-[480px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(242, 132, 130, 0.48) 0%, rgba(242, 132, 130, 0) 70%)',
          filter: 'blur(75px)',
        }}
      />
      <div
        className="animate-orb-3 absolute -bottom-24 left-[20%] h-[440px] w-[440px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(246, 189, 96, 0.55) 0%, rgba(246, 189, 96, 0) 72%)',
          filter: 'blur(75px)',
        }}
      />

      {/* Tiny warm sunset firefly / dust motes */}
      <div className="sunset-mote absolute top-[22%] left-[18%] h-2.5 w-2.5 rounded-full bg-[#FFF5D6]/80 blur-[1px]" />
      <div className="sunset-mote-delay absolute top-[46%] right-[16%] h-2 w-2 rounded-full bg-[#FFE4C4]/75 blur-[1px]" />
      <div className="sunset-mote absolute bottom-[26%] left-[34%] h-2 w-2 rounded-full bg-[#FFF8E7]/75 blur-[1px]" />
      <div className="sunset-mote-delay absolute bottom-[18%] right-[32%] h-3 w-3 rounded-full bg-[#FFD9B3]/65 blur-[2px]" />
    </div>
  );
}
