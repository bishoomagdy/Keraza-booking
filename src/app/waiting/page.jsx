"use client";

import "./page.css";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function WaitingPage() {
  const [leaderData, setLeaderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/register");
        return;
      }

      const docRef = doc(db, "leaders", user.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        router.push("/register");
        return;
      }

      const data = docSnap.data();

      if (data.approved === true) {
        if (data.role === "admin") {
          router.push("/admin/pending");
        } else {
          router.push("/leader/profile");
        }
      } else {
        setLeaderData(data);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) return <div className="wait-loading">جارٍ التحميل...</div>;

  return (
    <div className="wait-container">
      <h1 className="wait-title">في انتظار الموافقة</h1>
      <p className="wait-message">تم إنشاء حسابك بنجاح، وجاري مراجعته من قبل المسؤولين.</p>

      {leaderData && (
        <div className="wait-info">
          <h3>📄 بيانات التسجيل:</h3>
          <p><strong>الاسم:</strong> {leaderData.firstName} {leaderData.lastName}</p>
          <p><strong>البريد الإلكتروني:</strong> {leaderData.email}</p>
          <p><strong>رقم الهاتف:</strong> {leaderData.phone}</p>
          <p><strong>الكنيسة:</strong> {leaderData.church}</p>
        </div>
      )}
    </div>
  );
}
