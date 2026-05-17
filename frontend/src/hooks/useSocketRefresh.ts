import { useEffect } from "react";

import { subscribeToTaskUpdates } from "../socket";

export const useSocketRefresh = (onRefresh: () => void) => {
  useEffect(() => subscribeToTaskUpdates(onRefresh), [onRefresh]);
};