"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import "./page.css";
const competitionsData = [
  { id: "football_boys", name: "كرة القدم - بنين", pricePerUnit: 200 },
  { id: "football_girls", name: "كرة القدم - بنات", pricePerUnit: 200 },
  { id: "volleyball_boys", name: "الكرة الطائرة - بنين", pricePerUnit: 200 },
  { id: "volleyball_girls", name: "الكرة الطائرة - بنات", pricePerUnit: 200 },
  { id: "table_tennis_boys_individual", name: "تنس الطاولة - بنين - فردي", pricePerUnit: 30 },
  { id: "table_tennis_boys_team", name: "تنس الطاولة - بنين - جماعي", pricePerUnit: 200 },
  { id: "table_tennis_girls_individual", name: "تنس الطاولة - بنات - فردي", pricePerUnit: 30 },
  { id: "table_tennis_girls_team", name: "تنس الطاولة - بنات - جماعي", pricePerUnit: 200 },
  { id: "chess_boys_individual", name: "الشطرنج - بنين - فردي", pricePerUnit: 30 },
  { id: "chess_boys_team", name: "الشطرنج - بنين - جماعي", pricePerUnit: 200 },
  { id: "chess_girls_individual", name: "الشطرنج - بنات - فردي", pricePerUnit: 30 },
  { id: "chess_girls_team", name: "الشطرنج - بنات - جماعي", pricePerUnit: 200 },
  { id: "running_boys", name: "جري - بنين - فردي", pricePerUnit: 30 },
  { id: "running_girls", name: "جري - بنات - فردي", pricePerUnit: 30 },
];

export default function SportCompetitionsPage() {
  const [userChurch, setUserChurch] = useState(null);
  const [counts, setCounts] = useState({ competitions: {}, totalPayment: 0 });
  const [inputs, setInputs] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setError("يجب تسجيل الدخول أولاً");
        setLoading(false);
        return;
      }
      try {
        const userDoc = await getDoc(doc(db, "leaders", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          if (!data.church) {
            setError("لم يتم تحديد الكنيسة في بياناتك.");
            setLoading(false);
            return;
          }
          setUserChurch(data.church);
        } else {
          setError("لم يتم العثور على بيانات المستخدم.");
          setLoading(false);
        }
      } catch {
        setError("حدث خطأ في جلب بيانات المستخدم.");
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!userChurch) return;

    const docRef = doc(db, "church_competitions", userChurch);
    const unsubscribeData = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setCounts({
            competitions: data.competitions || {},
            totalPayment: data.totalPayment || 0,
          });
        } else {
          setCounts({ competitions: {}, totalPayment: 0 });
        }
        setLoading(false);
      },
      (err) => {
        setError("حدث خطأ أثناء تحميل بيانات المسابقات.");
        setLoading(false);
      }
    );

    return () => unsubscribeData();
  }, [userChurch]);

  function handleInputChange(id, value) {
    if (!/^\d*$/.test(value)) return;
    setInputs((prev) => ({ ...prev, [id]: value }));
  }

  async function handleSubmit(id) {
    const count = parseInt(inputs[id] || "0", 10);
    if (isNaN(count) || count < 0) return;

    try {
      const docRef = doc(db, "church_competitions", userChurch);
      const docSnap = await getDoc(docRef);

      let currentData = { competitions: {}, totalPayment: 0 };

      if (docSnap.exists()) {
        currentData = docSnap.data();
        if (!currentData.competitions) currentData.competitions = {};
      }

      const compPrice = competitionsData.find((c) => c.id === id).pricePerUnit;
      const totalPriceForComp = count * compPrice;

      currentData.competitions[id] = {
        count,
        totalPrice: totalPriceForComp,
      };

      currentData.totalPayment = Object.values(currentData.competitions).reduce(
        (acc, c) => acc + (c.totalPrice || 0),
        0
      );

      await setDoc(docRef, currentData, { merge: true });

      setInputs((prev) => ({ ...prev, [id]: "" }));
    } catch {
      setError("حدث خطأ أثناء الحفظ.");
    }
  }

  if (loading) return <p className="sport-loading">...جاري التحميل</p>;
  if (error) return <p className="sport-error">{error}</p>;
  if (!userChurch) return <p className="sport-error">يتم جلب بيانات الكنيسة...</p>;

  return (
    <div className="sport-container">
      <h1 className="sport-title">المسابقات الرياضية</h1>

      <div className="sport-total-cost">
        التكلفة الإجمالية لجميع المسابقات:{" "}
        <span>{counts.totalPayment.toLocaleString()} جـ</span>
      </div>

      <div className="sport-cards">
        {competitionsData.map(({ id, name, pricePerUnit }) => (
          <div key={id} className="sport-card">
            <h3 className="sport-card-title">{name}</h3>
            <p className="sport-card-price">سعر الاشتراك للفرد: {pricePerUnit} جـ</p>

            <div className="sport-input-section">
              <button
                className="sport-add-btn"
                onClick={() =>
                  setInputs((prev) => ({
                    ...prev,
                    [id]: inputs[id] !== undefined ? inputs[id] : "",
                  }))
                }
              >
                إضافة عدد المشتركين
              </button>

              {inputs[id] !== undefined && (
                <div className="sport-input-wrapper">
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className="sport-input"
                    placeholder="ادخل عدد المشتركين"
                    value={inputs[id]}
                    onChange={(e) => handleInputChange(id, e.target.value)}
                  />
                  <button
                    className="sport-submit-btn"
                    onClick={() => handleSubmit(id)}
                  >
                    حفظ
                  </button>
                </div>
              )}

              {counts.competitions[id] !== undefined && (
                <p className="sport-count-info">
                  عدد المشتركين: <strong>{counts.competitions[id].count}</strong> - التكلفة:{" "}
                  <strong>{counts.competitions[id].totalPrice.toLocaleString()} جـ</strong>
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
