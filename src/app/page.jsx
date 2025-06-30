"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const checkUserStatus = async () => {
      onAuthStateChanged(auth, async (user) => {
        if (!user) {
          // لو مش مسجل
          router.push("/register");
        } else {
          // نجيب بياناته من Firestore
          const userDoc = await getDoc(doc(db, "leaders", user.uid));
          const data = userDoc.data();

          if (data && data.approved === false) {
            router.push("/waiting");
          }

          // لو approved = true هنسيبه في الصفحة الحالية مؤقتًا
        }
      });
    };

    checkUserStatus();
  }, [router]);
}
