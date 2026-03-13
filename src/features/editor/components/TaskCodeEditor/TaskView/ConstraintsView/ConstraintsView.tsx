import clsx from "clsx";
import type { EvaluatedConstraint } from "../../../../../../core/game/constraints.ts";
import { useTranslatable } from "../../../../../../shared/i18n/i18n.ts";
import { useTasks } from "../../../../../precourse/context/TasksContext.tsx";
import styles from "./ConstraintsView.module.css";
import { Collapsable } from "../../../../../../shared/components/Collapsable/Collapsable.tsx";

type ConstraintsViewProps = {
  constraints: EvaluatedConstraint[];
};

export function ConstraintsView({ constraints }: ConstraintsViewProps) {
  const { t } = useTranslatable();
  const { task, completedTasks } = useTasks();
  const allConstraintsMet = constraints.every((c) => c.met);
  const metConstraintsCount = constraints.filter((c) => c.met).length;
  return (
    <>
      <Collapsable
        title={
          t("constraintsView.title") +
          ` (${metConstraintsCount}/${constraints.length})`
        }
        titleClassName={(open) =>
          clsx(
            styles.title,
            !open && styles.titleClosed,
            allConstraintsMet ? styles.titleMet : styles.titleUnmet,
          )
        }
      >
        <div className={styles.explanation}>
          {t("constraintsView.explanation")}
        </div>
        <ul className={styles.list}>
          {constraints?.map((constraint, i) => (
            <li
              key={i}
              className={clsx(
                styles.constraint,
                (constraint.met || completedTasks.includes(task.id)) &&
                  styles.met,
                // This could also be undefined if the constraint hasn't been evaluated yet
                constraint.met === false && styles.unmet,
              )}
            >
              {t(`constraints.${constraint.type}`, {
                ...constraint,
                allowed:
                  constraint.type === "allowed-instructions"
                    ? constraint.allowed.join(", ")
                    : undefined,
              })}
            </li>
          ))}
        </ul>
      </Collapsable>
    </>
  );
}
