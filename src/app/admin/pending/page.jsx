"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import "./page.css";

export default function PendingLeadersPage() {
  const [pendingLeaders, setPendingLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // ✅ حماية المسار
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/register");
        return;
      }

      const userDoc = await getDoc(doc(db, "leaders", user.uid));
      const userData = userDoc.data();

      if (!userData || userData.role !== "admin") {
        router.push("/leader/profile");
        return;
      }

      // ✅ لو أدمن، حمّل البيانات
      fetchPending();
    });

    return () => unsubscribe();
  }, []);

  const fetchPending = async () => {
    const q = query(collection(db, "leaders"), where("approved", "==", false));
    const snapshot = await getDocs(q);
    const leaders = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setPendingLeaders(leaders);
    setLoading(false);
  };

  const handleApprove = async (userId) => {
    const userRef = doc(db, "leaders", userId);
    await updateDoc(userRef, {
      approved: true,
      role: "leader",
      approvedAt: new Date(),
    });

    setPendingLeaders((prev) =>
      prev.filter((user) => user.id !== userId)
    );
  };

  if (loading) return <p className="ad-pend-loading">جارٍ التحميل...</p>;

  return (
    <div className="ad-pend-container">
      <h1 className="ad-pend-title">الخدام المنتظرين الموافقة</h1>
      {pendingLeaders.length === 0 ? (
        <p className="ad-pend-empty">لا يوجد خدام حالياً 👌</p>
      ) : (
        <ul className="ad-pend-list">
          {pendingLeaders.map((user) => (
            <li key={user.id} className="ad-pend-card">
              <div className="ad-pend-user-info">
                <p className="ad-pend-name">{user.firstName + " " + user.lastName}</p>
                <p className="ad-pend-name">{user.church}</p>
                <p className="ad-pend-email">{user.email}</p>
              </div>
              <button
                className="ad-pend-approve-btn"
                onClick={() => handleApprove(user.id)}
              >
               Approve
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
