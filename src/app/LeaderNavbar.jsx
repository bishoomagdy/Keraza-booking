"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export default function LeaderNavbar() {
  const [showNavbar, setShowNavbar] = useState(false);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "leaders", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();

          // ✅ لو Admin أو خادم Approved
          if (data.role === "admin" || data.approved === true) {
            setRole(data.role);
            setShowNavbar(true);
          }
        }
      }
    });

    return () => unsubscribe();
  }, []);

  if (!showNavbar) return null; // 🚫 مش هيظهر حاجة لو المستخدم مش مؤهل

  return (
    <>
      <nav className="leader-nav-top">
        {role === "admin" ? (
          <Link href="/admin/churches">الكنائس</Link>
        ) : (
          <>
            <Link href="/leader/sport-competitions">sport-compet.</Link>
            <Link href="/leader/other-competitions">other-compet.</Link>
          </>
        )}
      </nav>

      <nav className="leader-nav-bottom">
        {role === "admin" ? (
          <>
            <Link href="/admin/pending">خدام منتظرين</Link>
            <Link href="/admin/general">إحصائيات عامة</Link>
          </>
        ) : (
          <>
            <Link href="/leader/profile">Profile</Link>
            <Link href="/leader/church-info">Church info</Link>
          </>
        )}
      </nav>
    </>
  );
}
