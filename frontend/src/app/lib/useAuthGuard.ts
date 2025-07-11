import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "../lib/axios";

export function useAuthGuard() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const checkToken = async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) {
        router.replace("/");
        return;
      }
      try {
        const res = await api.get("/user/check_token_valid", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = res.data as { valid: boolean; message: string };
        if (!data.valid) {
          localStorage.removeItem("token");
          router.replace("/");
        } else {
          setChecked(true);
        }
      } catch {
        localStorage.removeItem("token");
        router.replace("/");
      }
    };
    checkToken();
  }, [router]);

  return checked;
} 