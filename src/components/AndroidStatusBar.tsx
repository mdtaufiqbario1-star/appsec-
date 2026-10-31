import React, { useState, useEffect } from 'react';
import { Wifi, Battery, Smartphone, Monitor } from 'lucide-react';

interface AndroidStatusBarProps {
  isFrameMode: boolean;
  onToggleFrame: () => void;
}

export const AndroidStatusBar: React.FC<AndroidStatusBarProps> = ({ isFrameMode, onToggleFrame }) => {
  const [time, setTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-[#0a0c10] border-b border-neutral-900/80 px-4 py-1.5 flex items-center justify-between text-[11px] text-neutral-400 select-none">
      <div className="flex items-center gap-2 font-mono font-medium tracking-tight text-neutral-300">
        <span>{time || '09:41'}</span>
        <span className="text-[9px] uppercase tracking-wider text-red-500 font-bold ml-1">
          REDPAGE 5G
        </span>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onToggleFrame}
          className="hidden md:flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono transition-colors border border-neutral-800 text-neutral-400 hover:text-white hover:border-red-600/50 bg-neutral-900/80"
          title={isFrameMode ? 'Switch to Full Screen View' : 'Preview in Android Phone Frame'}
        >
          {isFrameMode ? (
            <>
              <Monitor className="w-3 h-3 text-red-400" />
              <span>Full Screen</span>
            </>
          ) : (
            <>
              <Smartphone className="w-3 h-3 text-red-400" />
              <span>Android Mockup</span>
            </>
          )}
        </button>

        <div className="flex items-center gap-1.5 text-neutral-400">
          <Wifi className="w-3.5 h-3.5 text-neutral-300" />
          <div className="flex items-center gap-1">
            <span className="font-mono text-[10px] text-neutral-300">98%</span>
            <Battery className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400/20" />
          </div>
        </div>
      </div>
    </div>
  );
};
