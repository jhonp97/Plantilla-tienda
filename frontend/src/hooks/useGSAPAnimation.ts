/**
 * useGSAPAnimation - Safe GSAP animation hook
 *
 * Wraps GSAP animations with prefers-reduced-motion respect
 * and automatic cleanup on unmount.
 *
 * @usage
 * ```tsx
 * const { animate, timeline } = useGSAPAnimation();
 *
 * useEffect(() => {
 *   animate('.my-element', { opacity: 1, y: 0, duration: 0.5 });
 * }, [animate]);
 * ```
 */

import { useCallback, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

type AnimationTarget = string | Element | Element[] | NodeList;
type AnimationVars = gsap.TweenVars;

interface StaggerOptions {
  targets: AnimationTarget;
  fromVars?: AnimationVars;
  stagger?: number;
  baseDelay?: number;
}

interface ScrollTriggerOptions {
  target: AnimationTarget;
  animationVars: AnimationVars;
  trigger?: string | Element;
  start?: string;
  end?: string;
  toggleActions?: string;
}

interface CurtainRevealOptions {
  target: AnimationTarget;
  trigger?: string | Element;
  start?: string;
}

interface CrossfadeHoverOptions {
  primaryTarget: AnimationTarget;
  secondaryTarget: AnimationTarget;
  duration?: number;
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function useGSAPAnimation() {
  const ctxRef = useRef<gsap.Context | null>(null);
  const tweensRef = useRef<gsap.core.Tween[]>([]);

  useEffect(() => {
    ctxRef.current = gsap.context(() => {});
    return () => {
      // Kill all tweens and revert context on unmount
      tweensRef.current.forEach((t) => t.kill());
      tweensRef.current = [];
      ctxRef.current?.revert();
    };
  }, []);

  const animate = useCallback(
    (target: AnimationTarget, vars: AnimationVars): gsap.core.Tween | null => {
      if (prefersReducedMotion()) {
        gsap.set(target, { clearProps: 'all' });
        return null;
      }

      const tween = gsap.to(target, {
        ...vars,
        overwrite: 'auto',
      });
      tweensRef.current.push(tween);
      return tween;
    },
    [],
  );

  const staggerIn = useCallback(
    (options: StaggerOptions): gsap.core.Tween | null => {
      if (prefersReducedMotion()) {
        gsap.set(options.targets, { clearProps: 'all' });
        return null;
      }

      const tween = gsap.fromTo(
        options.targets,
        { opacity: 0, y: 20, ...options.fromVars },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: options.stagger ?? 0.05,
          delay: options.baseDelay ?? 0,
          ease: 'power2.out',
          overwrite: 'auto',
        },
      );
      tweensRef.current.push(tween);
      return tween;
    },
    [],
  );

  const fadeIn = useCallback(
    (target: AnimationTarget, vars?: AnimationVars): gsap.core.Tween | null => {
      if (prefersReducedMotion()) {
        gsap.set(target, { clearProps: 'all' });
        return null;
      }

      const tween = gsap.fromTo(
        target,
        { opacity: 0, ...vars?.from },
        {
          opacity: 1,
          duration: 0.6,
          ease: 'power2.out',
          ...vars,
          overwrite: 'auto',
        },
      );
      tweensRef.current.push(tween);
      return tween;
    },
    [],
  );

  const slideUp = useCallback(
    (target: AnimationTarget, vars?: AnimationVars): gsap.core.Tween | null => {
      if (prefersReducedMotion()) {
        gsap.set(target, { clearProps: 'all' });
        return null;
      }

      const tween = gsap.fromTo(
        target,
        { opacity: 0, y: 40, ...vars?.from },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power3.out',
          ...vars,
          overwrite: 'auto',
        },
      );
      tweensRef.current.push(tween);
      return tween;
    },
    [],
  );

  const scrollTrigger = useCallback(
    (options: ScrollTriggerOptions): gsap.core.Tween | null => {
      if (prefersReducedMotion()) {
        gsap.set(options.target, { clearProps: 'all' });
        return null;
      }

      const tween = gsap.fromTo(
        options.target,
        { opacity: 0, y: 40, ...options.animationVars.from },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: options.trigger ?? (options.target as string),
            start: options.start ?? 'top 85%',
            end: options.end ?? 'top 40%',
            toggleActions: options.toggleActions ?? 'play none none reverse',
          },
          ...options.animationVars,
          overwrite: 'auto',
        },
      );
      tweensRef.current.push(tween);
      return tween;
    },
    [],
  );

  /** ── Curtain Reveal ──
   * Animates clip-path from inset(0 0 100% 0) to inset(0 0 0% 0)
   * triggered by ScrollTrigger when element enters viewport.
   */
  const curtainReveal = useCallback(
    (options: CurtainRevealOptions): gsap.core.Tween | null => {
      if (prefersReducedMotion()) {
        gsap.set(options.target, { clearProps: 'all' });
        return null;
      }

      const tween = gsap.fromTo(
        options.target,
        { clipPath: 'inset(0 0 100% 0)' },
        {
          clipPath: 'inset(0 0 0% 0)',
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: options.trigger ?? (options.target as string),
            start: options.start ?? 'top 85%',
          },
          overwrite: 'auto',
        },
      );
      tweensRef.current.push(tween);
      return tween;
    },
    [],
  );

  /** ── Crossfade Hover ──
   * Crossfades between primary and secondary elements on hover.
   * Duration default 0.3s with power1.inOut easing.
   */
  const crossfadeHover = useCallback(
    (options: CrossfadeHoverOptions): (() => void) | null => {
      if (prefersReducedMotion()) {
        gsap.set(options.primaryTarget, { clearProps: 'all' });
        gsap.set(options.secondaryTarget, { clearProps: 'all' });
        return null;
      }

      const duration = options.duration ?? 0.3;
      const ease = 'power1.inOut';

      const enterTween = gsap.to(options.primaryTarget, {
        opacity: 0,
        duration,
        ease,
        overwrite: 'auto',
      });
      const leaveTween = gsap.to(options.secondaryTarget, {
        opacity: 0,
        duration,
        ease,
        paused: true,
        overwrite: 'auto',
      });

      tweensRef.current.push(enterTween, leaveTween);

      const onEnter = () => {
        gsap.to(options.secondaryTarget, { opacity: 1, duration, ease, overwrite: 'auto' });
        gsap.to(options.primaryTarget, { opacity: 0, duration, ease, overwrite: 'auto' });
      };

      const onLeave = () => {
        gsap.to(options.primaryTarget, { opacity: 1, duration, ease, overwrite: 'auto' });
        gsap.to(options.secondaryTarget, { opacity: 0, duration, ease, overwrite: 'auto' });
      };

      // Attach event listeners to the targets
      const primaryEl = options.primaryTarget instanceof Element
        ? options.primaryTarget
        : typeof options.primaryTarget === 'string'
          ? document.querySelector(options.primaryTarget)
          : null;

      if (primaryEl) {
        primaryEl.addEventListener('mouseenter', onEnter);
        primaryEl.addEventListener('mouseleave', onLeave);

        // Return cleanup function
        return () => {
          primaryEl.removeEventListener('mouseenter', onEnter);
          primaryEl.removeEventListener('mouseleave', onLeave);
        };
      }

      return null;
    },
    [],
  );

  const pageOut = useCallback(
    (target: AnimationTarget): Promise<void> => {
      return new Promise((resolve) => {
        if (prefersReducedMotion()) {
          resolve();
          return;
        }

        const tween = gsap.to(target, {
          opacity: 0,
          y: -15,
          duration: 0.25,
          ease: 'power2.in',
          onComplete: resolve,
        });
        tweensRef.current.push(tween);
      });
    },
    [],
  );

  const pageIn = useCallback(
    (target: AnimationTarget): Promise<void> => {
      return new Promise((resolve) => {
        if (prefersReducedMotion()) {
          gsap.set(target, { clearProps: 'all' });
          resolve();
          return;
        }

        gsap.set(target, { opacity: 0, y: 15 });
        const tween = gsap.to(target, {
          opacity: 1,
          y: 0,
          duration: 0.3,
          ease: 'power3.out',
          onComplete: resolve,
        });
        tweensRef.current.push(tween);
      });
    },
    [],
  );

  const cleanup = useCallback(() => {
    tweensRef.current.forEach((t) => t.kill());
    tweensRef.current = [];
    ctxRef.current?.revert();
  }, []);

  return {
    animate,
    staggerIn,
    fadeIn,
    slideUp,
    scrollTrigger,
    curtainReveal,
    crossfadeHover,
    pageOut,
    pageIn,
    cleanup,
  };
}

export default useGSAPAnimation;
