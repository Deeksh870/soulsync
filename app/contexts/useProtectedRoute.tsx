// contexts/useProtectedRoute.ts
import { router } from "expo-router";
import { useEffect } from "react";
import { useAuth } from "./AuthContext";

export function useProtectedRoute() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user]);
}
