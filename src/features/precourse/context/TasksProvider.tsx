import { TasksContext } from "./TasksContext.tsx";
import {
  type PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { loadDays, taskIdOf } from "../day.ts";
import {
  usePersistentState,
  usePersistentStorage,
} from "../../../shared/utils/storage.ts";
import { useModalContext } from "../../../shared/floating/context/ModalContext.tsx";
import { TaskCompleted } from "../components/TaskCompleted/TaskCompleted.tsx";
import { useTranslation } from "react-i18next";

type TasksProviderProps = {
  taskId: string | null;
  namespace: string;
};

export function TasksProvider({
  taskId: initialTaskId,
  namespace,
  children,
}: PropsWithChildren<TasksProviderProps>) {
  const storage = usePersistentStorage(namespace);

  const [taskId, setTaskId] = useState<string | null>(initialTaskId);
  const [storedTaskId, setStoredTaskId] = usePersistentState<string | null>(
    storage,
    "lastTaskId",
    null,
  );

  // Memoize data
  const days = useMemo(() => loadDays(), []);
  const task = useMemo(() => {
    const allTasks = days.flatMap((day) => day.tasks);
    // Try finding task id given by url param
    const found = allTasks.find((t) => t.id === taskId);
    if (found) return found;
    // Try stored task
    if (storedTaskId !== null) {
      const stored = allTasks.find((t) => t.id === storedTaskId);
      if (stored) return stored;
    }
    // Fall back to day 1 task 1
    const firstDayId = taskIdOf(1, 1);
    return allTasks.find((t) => t.id === firstDayId)!;
  }, [days, storedTaskId, taskId]);

  // Track completed data
  const [completedTasks, setCompletedTasks] = usePersistentState<string[]>(
    storage,
    "completedTasks",
    [],
  );
  const modal = useModalContext();
  const { t } = useTranslation();

  const setCompleted = useCallback(
    (taskId: string, completed: boolean) => {
      setCompletedTasks((prev) => {
        if (completed) {
          // Don't add duplicates
          if (prev.includes(taskId)) {
            return prev;
          }
          return [...prev, taskId];
        } else {
          return prev.filter((id) => id !== taskId);
        }
      });
      // Popup
      if (completed) {
        modal.setProps({ title: t("taskCompleted.title"), maxWidth: 600 });
        modal.setContent(
          <TaskCompleted
            task={task}
            days={days}
            setTaskId={setTaskId}
            modal={modal}
          />,
        );
        modal.setOpen(true);
      }
    },
    [days, modal, setCompletedTasks, t, task],
  );

  // Update stored task
  useEffect(() => {
    if (taskId === null) return;
    setStoredTaskId(taskId);
  }, [setStoredTaskId, taskId]);

  return (
    <TasksContext.Provider
      value={{
        task,
        setTaskId,
        completedTasks,
        setCompleted,
        days,
      }}
    >
      {children}
    </TasksContext.Provider>
  );
}
