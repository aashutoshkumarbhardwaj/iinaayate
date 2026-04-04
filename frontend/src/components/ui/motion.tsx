import { motion, type HTMLMotionProps, type Variants } from 'framer-motion';
import type { PropsWithChildren } from 'react';

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease },
  },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.08,
    },
  },
};

export function FadeIn(props: HTMLMotionProps<'div'>) {
  const { children, variants, initial, whileInView, viewport, transition, ...rest } = props;

  return (
    <motion.div
      variants={variants ?? fadeInUp}
      initial={initial ?? 'hidden'}
      whileInView={whileInView ?? 'visible'}
      viewport={viewport ?? { once: true, amount: 0.2 }}
      transition={transition}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

export function FadeInStagger({ children, ...rest }: PropsWithChildren<HTMLMotionProps<'div'>>) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.12 }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
