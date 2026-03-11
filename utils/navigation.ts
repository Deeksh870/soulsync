// utils/navigation.ts
import { router } from "expo-router";

export function goBackSafe() {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace("/dashboard");   // ← FIX: always go to dashboard
  }
}
