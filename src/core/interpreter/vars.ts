// Predefined vars

import { Environment, type VariableValue } from "./environment.ts";

export type VariableBehavior = {
  onGet?: (env: Environment) => VariableValue;
  onSet?: (value: VariableValue, env: Environment) => void;
};

/**
 * Predefined variables always start with "$"
 */
export const PREDEFINED_VARIABLES: Record<string, VariableBehavior> = {
  $assert: {
    onSet: (value) => {
      if (value === 0) {
        throw new Error("Assertion failed!");
      }
    },
  },
  $flip: {
    onGet: () => {
      return Math.random() > .5 ? 1 : 0;
    }
  },
  $random: {
    onGet: () => {
      return Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
    }
  }
};
