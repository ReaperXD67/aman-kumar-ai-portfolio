import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";
let media;
const getMedia = () => media || (media = window.matchMedia(QUERY));
const subscribe = (notify) => {
  const query = getMedia();
  query.addEventListener("change", notify);
  return () => query.removeEventListener("change", notify);
};
const snapshot = () => getMedia().matches;

// React to an OS preference change without requiring a page reload.
export function useReducedMotion() {
  return useSyncExternalStore(subscribe, snapshot, () => true);
}
