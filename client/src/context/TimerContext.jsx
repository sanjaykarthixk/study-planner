import { createContext, useContext, useState, useRef, useCallback } from 'react';
import { createSession } from '../api';
import toast from 'react-hot-toast';

const TimerContext = createContext();

const MODES = {
  focus:       { label: 'Focus',       duration: 25 * 60 },
  short_break: { label: 'Short Break', duration: 5  * 60 },
  long_break:  { label: 'Long Break',  duration: 15 * 60 },
};

export const TimerProvider = ({ children }) => {
  const [mode, setMode]               = useState('focus');
  const [timeLeft, setTimeLeft]       = useState(MODES.focus.duration);
  const [isRunning, setIsRunning]     = useState(false);
  const [round, setRound]             = useState(1);
  const [activeSubject, setActiveSubject] = useState(null);
  const intervalRef = useRef(null);

  const clearTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
  };

  const switchMode = useCallback((newMode) => {
    clearTimer();
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(MODES[newMode].duration);
  }, []);

  const start = useCallback(() => {
    if (!activeSubject) {
      toast.error('Please select a subject first!');
      return;
    }
    setIsRunning(true);
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          setIsRunning(false);
          handleSessionComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [activeSubject, mode]);

  const pause = useCallback(() => {
    clearTimer();
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    clearTimer();
    setIsRunning(false);
    setTimeLeft(MODES[mode].duration);
  }, [mode]);

  const handleSessionComplete = async () => {
    const duration = Math.round(MODES[mode].duration / 60);
    toast.success(`${MODES[mode].label} session complete! 🎉`);

    if (mode === 'focus' && activeSubject) {
      try {
        await createSession({ subjectId: activeSubject._id, duration, type: mode });
      } catch (e) {
        console.error('Session save error:', e);
      }
    }

    // Auto advance: after 4 focus rounds → long break, else short break
    if (mode === 'focus') {
      const newRound = round + 1;
      setRound(newRound);
      switchMode(newRound % 4 === 0 ? 'long_break' : 'short_break');
    } else {
      switchMode('focus');
    }
  };

  const formatTime = (secs) => {
    const m = String(Math.floor(secs / 60)).padStart(2, '0');
    const s = String(secs % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  const progress = 1 - timeLeft / MODES[mode].duration;

  return (
    <TimerContext.Provider value={{
      mode, timeLeft, isRunning, round, activeSubject,
      setActiveSubject, switchMode, start, pause, reset,
      formatTime, progress, MODES,
    }}>
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = () => useContext(TimerContext);