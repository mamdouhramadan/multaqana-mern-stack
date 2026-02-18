"use client";

import { motion, type Variants } from "framer-motion";

export type AnimatedListAnimation = "fade" | "fadeUp" | "fadeDown";

const defaultContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: (staggerDelay: number) => ({
    opacity: 1,
    transition: { staggerChildren: staggerDelay, delayChildren: 0 },
  }),
};

const itemVariants: Record<AnimatedListAnimation, Variants> = {
  fade: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  fadeUp: {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0 },
  },
  fadeDown: {
    hidden: { opacity: 0, y: -12 },
    visible: { opacity: 1, y: 0 },
  },
};

export interface AnimatedListProps<T> {
  /** Data array (e.g. faqs, files, magazines) */
  items: T[];
  /** Render each item; receives item and index for stagger delay */
  renderItem: (item: T, index: number) => React.ReactNode;
  /** Unique key for each item */
  keyExtractor: (item: T, index: number) => string | number;
  /** Class name for the container (e.g. "grid grid-cols-1 md:grid-cols-3 gap-6") */
  className?: string;
  /** Class name for each item wrapper (motion.div) */
  itemClassName?: string;
  /** Delay between each item in seconds (default 0.05) */
  staggerDelay?: number;
  /** Duration of each item animation in seconds (default 0.3) */
  duration?: number;
  /** Animation style (default "fade") */
  animation?: AnimatedListAnimation;
}

/**
 * Wraps a list or grid with staggered fade-in animation using Framer Motion.
 * Use for files, magazines, news, or any list/grid of items.
 * For Radix Accordion (e.g. FAQ), use motion(AccordionItem) with delay per index instead.
 */
export function AnimatedList<T>({
  items,
  renderItem,
  keyExtractor,
  className,
  itemClassName,
  staggerDelay = 0.05,
  duration = 0.3,
  animation = "fade",
}: AnimatedListProps<T>) {
  const variants = itemVariants[animation];
  const transition = { duration };

  return (
    <motion.div
      className={className}
      variants={{
        ...defaultContainerVariants,
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: 0,
          },
        },
      }}
      initial="hidden"
      animate="visible"
      custom={staggerDelay}
    >
      {items.map((item, index) => (
        <motion.div
          key={keyExtractor(item, index)}
          className={itemClassName}
          variants={variants}
          transition={transition}
        >
          {renderItem(item, index)}
        </motion.div>
      ))}
    </motion.div>
  );
}

export default AnimatedList;
