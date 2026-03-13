import { type CSSProperties, type ReactNode, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import styles from "./Collapsable.module.css";
import { IoIosArrowDown } from "react-icons/io";
import clsx from "clsx";

export type CollapsableProps = {
  title: string;
  titleClassName?: (open: boolean) => string;
  titleStyle?: CSSProperties;
  initialOpen?: boolean;
  children: ReactNode | ((open: boolean) => ReactNode);
};

export function Collapsable({
  title,
  titleClassName,
  titleStyle,
  children,
  initialOpen = false,
}: CollapsableProps) {
  const [isOpen, setIsOpen] = useState(initialOpen);
  return (
    <>
      <div
        className={clsx(
          styles.title,
          isOpen && styles.open,
          titleClassName?.(isOpen),
        )}
        style={titleStyle}
        onClick={() => setIsOpen((p) => !p)}
      >
        <div>
          <motion.div
            className={styles.icon}
            animate={{ rotate: isOpen ? 0 : -90 }}
            transition={{ type: "spring", stiffness: 500, damping: 50 }}
          >
            <IoIosArrowDown />
          </motion.div>
        </div>
        {title}
      </div>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            className={styles.container}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 50 }}
          >
            {typeof children === "function" ? children(initialOpen) : children}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
