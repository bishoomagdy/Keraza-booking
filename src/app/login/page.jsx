"use client";

import "./page.css";
import { useState, useEffect } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Select from "react-select";
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // success | error
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      auth.onAuthStateChanged(async (user) => {
        if (user) {
          const docRef = doc(db, "leaders", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();

            if (data.role === "admin") {
              router.push("/admin/pending");
            } else if (data.approved === true) {
              router.push("/leader/profile");
            } else {
              router.push("/waiting");
            }
          }
        }
      });
    };
    checkUser();
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setMessageType("");

    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const user = userCred.user;

      const docSnap = await getDoc(doc(db, "leaders", user.uid));
      if (!docSnap.exists()) {
        setMessage("❌ الحساب غير موجود في قاعدة البيانات.");
        setMessageType("error");
        setLoading(false);
        return;
      }

      const data = docSnap.data();
      if (data.role === "admin") {
        router.push("/admin/pending");
      } else if (data.approved === true) {
        router.push("/leader/profile");
      } else {
        router.push("/waiting");
      }

    } catch (err) {
      console.error(err);
      if (err.code === "auth/user-not-found") {
        setMessage("❌ الإيميل غير مسجل.");
      } else if (err.code === "auth/wrong-password") {
        setMessage("❌ كلمة المرور غير صحيحة.");
      } else {
        setMessage("❌ حصل خطأ أثناء تسجيل الدخول.");
      }
      setMessageType("error");
    }

    setLoading(false);
  };

  return (
    <div className="reg-container">
      <h1 className="reg-title">تسجيل الدخول</h1>
      <form onSubmit={handleLogin} className="reg-form">
        <input
          type="email"
          name="email"
          placeholder="البريد الإلكتروني"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="reg-input"
        />
        <input
          type="password"
          name="password"
          placeholder="كلمة المرور"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="reg-input"
        />

        <button type="submit" disabled={loading} className="reg-button">
          {loading ? "جارٍ تسجيل الدخول..." : "تسجيل الدخول"}
        </button>

        {message && (
          <p className={`reg-message ${messageType === "success" ? "success" : "error"}`}>
            {message}
          </p>
        )}

        <p className="reg-note">
          حساب جديد؟{" "}
          <a href="/register" className="reg-link">سجّل من هنا</a>
        </p>
      </form>
    </div>
  );
}
