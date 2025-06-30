"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  getDoc,
  doc,
  updateDoc,
  setDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import * as XLSX from "xlsx";
import "./page.css";

const churchList = [
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

export default function ChurchesPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return router.push("/register");
      const userDoc = await getDoc(doc(db, "leaders", user.uid));
      if (!userDoc.exists() || userDoc.data().role !== "admin")
        return router.push("/leader/profile");

      fetchData();
    });
    return () => unsubscribe();
  }, []);
const handlePaidToggle = async (id, current) => {
  if (!id) return;

  // ✅ تحديث قيمة الدفع في كولكشن leaders
  await updateDoc(doc(db, "leaders", id), {
    paid: !current,
  });

  // ✅ تحديث في كولكشن الكنائس
  const updatedChurch = data.find((item) => item.id === id);
  if (updatedChurch) {
    await updateDoc(doc(db, "churches", updatedChurch.church), {
      paid: !current,
    });
  }

  // ✅ تحديث في واجهة المستخدم
  setData((prev) =>
    prev.map((item) =>
      item.id === id ? { ...item, paid: !current } : item
    )
  );
};

const fetchData = async () => {
  const leadersSnapshot = await getDocs(collection(db, "leaders"));
  const sportSnapshot = await getDocs(collection(db, "church_competitions"));
  const otherSnapshot = await getDocs(collection(db, "other-competitions"));

  const allCompetitions = [...sportSnapshot.docs, ...otherSnapshot.docs];

  const result = churchList.map((church) => {
    const leader = leadersSnapshot.docs.find(
      (doc) => doc.data().church === church
    );

    const churchComps = allCompetitions.filter(
      (comp) => comp.id === church
    );

    const totalSubs = churchComps.reduce((sum, comp) => {
      const competitions = comp.data().competitions || {};
      const counts = Object.values(competitions).map((c) => c.count || 0);
      return sum + counts.reduce((a, b) => a + b, 0);
    }, 0);

    const totalPayment = churchComps.reduce((sum, comp) => {
      const competitions = comp.data().competitions || {};
      const prices = Object.values(competitions).map((c) => c.totalPrice || 0);
      return sum + prices.reduce((a, b) => a + b, 0);
    }, 0);

    const paid = leader?.data()?.paid || false;

    const leaderName = leader?.data()
      ? `${leader.data().firstName} ${leader.data().lastName}`
      : "—";

    return {
      church,
      leader: leaderName,
      subscribers: totalSubs,
      totalPayment,
      paid,
      id: leader?.id,
    };
  });

  setData(result);
  setLoading(false);

  // 🏗️ كتابة البيانات في كولكشن churches
  for (const item of result) {
const docData = {
  church: item.church,
  leader: item.leader,
  subscribers: item.subscribers,
  totalPayment: item.totalPayment,
  paid: item.paid,
};

if (item.id) {
  docData.leaderId = item.id;
}

await setDoc(doc(db, "churches", item.church), docData);

  }
};



  const downloadExcel = () => {
    const exportData = data.map((row) => ({
      "الكنيسة": row.church,
      "الخادم": row.leader,
      "عدد المشتركين": row.subscribers,
      "المال المطلوب": row.totalPayment,
      "تم الدفع؟": row.paid ? "✔" : "✘",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Churches");
    XLSX.writeFile(workbook, "churches_report.xlsx");
  };

  if (loading) return <p className="ad-church-loading">Loading...</p>;

  return (
    <div className="ad-church-container">
      <h1 className="ad-church-title">تقرير الكنائس والاشتراكات</h1>
      <button className="ad-church-download-btn" onClick={downloadExcel}>
        ⬇ تحميل Excel
      </button>
      <div className="ad-church-table-wrapper">
        <table className="ad-church-table">
          <thead>
            <tr>
              <th>الكنيسة</th>
              <th>الخادم</th>
              <th>عدد المشتركين</th>
              <th>المال المطلوب</th>
              <th>تم الدفع؟</th>
            </tr>
          </thead>
          <tbody>
            {data.map((church) => (
              <tr key={church.church}>
                <td>{church.church}</td>
                <td>{church.leader}</td>
                <td>{church.subscribers}</td>
                <td>{church.totalPayment} ج</td>
                <td>
            <input
            type="checkbox"
            checked={church.paid}
            onChange={() => handlePaidToggle(church.id, church.paid)}
            />

                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
