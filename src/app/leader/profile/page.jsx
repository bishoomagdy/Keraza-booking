"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import SelectChurch from "@/components/SelectChurch";
import "./page.css";

export default function LeaderProfile() {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const router = useRouter();

  const churches = [
    "كنيسة الشهيد العظيم مارمينا بفلمنج",
    "كنيسة السيدة العذراء مريم و القديس يوحنا الحبيب بجناكليس",
    "كنيسة السيدة العذراء مريم و الانبا باخوميوس  شارع سوريا",
    "كنيسة رئيس الملائكة الجليل ميخائيل بمصطفى كامل",
    "كنيسة السيدة العذراء مريم و الشهيد العظيم مارمرقس الرسول بجرين بلازا",
    "كنيسة العذراء ومارجرجس بغبريال",
    "كنيسة الانبا شنوده والانبا هرمينا بدنا",
    "كنيسة مارجرجس باكوس",
    "كنيسة العذراء والانبا باخوميوس كوبرى الناموس (البشارة)",
    "كنيسة الملاك ميخائيل والانبا كاراس ارض الفولى",
    "كنيسة العذراء وابوسيفين حجر النواتيه",
    "كنيسة العذراء و مارمرقس جرين بلازا – خدمة ام الرحمة",
    "كنيسة مارجرجس والانبا انطونيوس محرم بك",
    "كنيسة ابوسيفين امبروزو",
    "كنيسة العذراء محرم بك",
    "كنيسة العذراء ومارمينا بالمستشفى القبطى",
    "كنيسة الانبا ابرام زين العابدين محرم بك",
    "كنيسة العذراء والقديس بولس بكرموز",
    "كنيسة الملاك ميخائيل غربال",
    "جمعية اصدقاء الكتاب المقدس محرم بك",
    "جمعية الملاك ميخائيل محرم بك",
    "كنيسة العذراء مريم و ابونا سمعان الاخميمي بغربال",
    "كنيسة الشهيد العظيم مارجرجس بالحضرة",
    "كنيسة القديس ابومقار و البابا كيرلس السادس بالدريسة",
  ];

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

      if (data.approved === false) {
        router.push("/waiting");
        return;
      }

      setUserData(data);
      setFormData({
        phone: data.phone || "",
        church: data.church || "",
      });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleEditChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!auth.currentUser) return;
    const docRef = doc(db, "leaders", auth.currentUser.uid);
    await updateDoc(docRef, formData);
    setUserData((prev) => ({ ...prev, ...formData }));
    setEditMode(false);
  };

  if (loading) return <p className="loading">جاري التحميل...</p>;

  return (
    <div className="profile-container">
      <h1 className="profile-title">الملف الشخصي للخادم</h1>
      <div className="profile-card">
        <p><span className="profile-label">الاسم:</span> <span className="profile-value">{userData.firstName} {userData.lastName}</span></p>
        <p><span className="profile-label">الإيميل:</span> <span className="profile-value">{userData.email}</span></p>

        {editMode ? (
          <>
            <div className="profile-field">
              <span className="profile-label">رقم التليفون:</span>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleEditChange}
                className="edit-input"
              />
            </div>

            <div className="profile-field">
              <span className="profile-label">الكنيسة:</span>
              <SelectChurch
                options={churches.map((ch) => ({ value: ch, label: ch }))}
                onChange={(value) => setFormData({ ...formData, church: value })}
                defaultValue={{ value: formData.church, label: formData.church }}
              />
            </div>


          </>
        ) : (
          <>
            <p><span className="profile-label">التليفون:</span> <span className="profile-value">{userData.phone}</span></p>
            <p><span className="profile-label">الكنيسة:</span> <span className="profile-value">{userData.church}</span></p>
          </>
        )}

        <p><span className="profile-label">تاريخ التسجيل:</span> <span className="profile-value">{userData.createdAt?.toDate().toLocaleDateString("ar-EG")}</span></p>

        <div style={{ marginTop: "20px" }}>
          {editMode ? (
            <>
              <button className="profile-button save" onClick={handleSave}>💾 حفظ التعديلات</button>
              <button className="profile-button cancel" onClick={() => setEditMode(false)}>❌ إلغاء</button>
            </>
          ) : (
            <button className="profile-button edit" onClick={() => setEditMode(true)}>✏️ تعديل البيانات</button>
          )}
        </div>
      </div>
    </div>
  );
}
