import React from 'react';
import { Fade } from '@animate-ui/react/primitives/effects/fade';
import { useMotionTokens, useShouldReduceMotion } from '@animate-ui/react/utils/motion';

// A short entrance keeps the newly swapped content readable and immediately interactive.
export function Entrance({ children }) {
  const reduce = useShouldReduceMotion();
  const { transition } = useMotionTokens();
  return <Fade asChild
    initial={reduce ? false : 'hidden'}
    initialOpacity={0.65}
    transition={transition.swap}
  >{children}</Fade>;
}
