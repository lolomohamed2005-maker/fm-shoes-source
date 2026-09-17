import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  lightText?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showText = true,
  lightText = false,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-11 h-11',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  };

  return (
    <div className={`flex items-center gap-2.5 text-right ${className}`}>
      {/* Circular Logo Badge */}
      <div
        className={`${sizeClasses[size]} relative rounded-full overflow-hidden shrink-0 border-2 border-amber-600/30 shadow-md bg-[#efe8dc] flex items-center justify-center`}
      >
        <img
          src="/logo.png"
          alt="FM Shoes & Clogs"
          className="w-full h-full object-cover"
          onError={(e) => {
            // If image not found, fallback to beautiful stylized monogram
            e.currentTarget.style.display = 'none';
          }}
        />
        {/* Monogram fallback text in case image fails to load */}
        <span className="font-serif font-black text-stone-900 absolute text-sm tracking-wider">
          FM
        </span>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-black tracking-tight leading-none ${
                lightText ? 'text-white' : 'text-stone-900'
              } ${size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-2xl' : 'text-xl'}`}
            >
              FM SHOES
            </span>
            <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30">
              & CLOGS
            </span>
          </div>
          <span
            className={`text-[10px] font-semibold tracking-wider mt-0.5 ${
              lightText ? 'text-amber-300' : 'text-stone-500'
            }`}
          >
            STEP INTO COMFORT
          </span>
        </div>
      )}
    </div>
  );
};
