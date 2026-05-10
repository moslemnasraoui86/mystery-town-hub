import { useServerFn } from "@tanstack/react-start";
import { appendRecord } from "./jsonbin.functions";

export function useJsonBinAppend() {
  const fn = useServerFn(appendRecord);
  return async (collection: string, record: Record<string, any>) => {
    try {
      await fn({ data: { collection, record } });
    } catch (e) {
      console.warn("JSONBin mirror failed:", e);
    }
  };
}
