'use client';

import { useCallback, useRef, useState } from 'react';
import type { MouseEvent } from 'react';

export function useAdminHoverTooltip<T>(closeDelayMs = 200) {
  const [item, setItem] = useState<T | null>(null);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const handleMouseEnter = useCallback(
    (data: T, event: MouseEvent<HTMLElement>) => {
      clearTimer();
      setItem(data);
      setAnchorRect(event.currentTarget.getBoundingClientRect());
    },
    [clearTimer]
  );

  const handleMouseLeave = useCallback(() => {
    clearTimer();
    timerRef.current = setTimeout(() => {
      setItem(null);
      setAnchorRect(null);
    }, closeDelayMs);
  }, [clearTimer, closeDelayMs]);

  const cancelClose = useCallback(() => {
    clearTimer();
  }, [clearTimer]);

  const scheduleClose = useCallback(() => {
    clearTimer();
    timerRef.current = setTimeout(() => {
      setItem(null);
      setAnchorRect(null);
    }, closeDelayMs);
  }, [clearTimer, closeDelayMs]);

  const close = useCallback(() => {
    clearTimer();
    setItem(null);
    setAnchorRect(null);
  }, [clearTimer]);

  return {
    item,
    anchorRect,
    handleMouseEnter,
    handleMouseLeave,
    cancelClose,
    scheduleClose,
    close,
  };
}
