"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "./page.css";

const COLORS = [
  "#0088FE", "#00C49F", "#FFBB28", "#FF8042",
  "#b455f0", "#e35f5f", "#40a965", "#f58f00"
];

const competitionNamesInArabic = { /* نفس اللي كان موجود */ };

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

const getResponsiveRadius = () => {
  if (typeof window === 'undefined') return 100;
  const width = window.innerWidth;
  if (width < 400) return 70;
  if (width < 600) return 85;
  return 100;
};

export default function ChurchDetailsAdminPage() {
  const [churchData, setChurchData] = useState([]);
  const [filteredChurches, setFilteredChurches] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      const all = [];

      for (let name of churches) {
        let competitions = [];
        let total = 0;
        let leaderName = "";

        const churchSnap = await getDoc(doc(db, "church_competitions", name));
        const otherSnap = await getDoc(doc(db, "other-competitions", name));

        const data1 = churchSnap.exists() ? churchSnap.data().competitions : {};
        const data2 = otherSnap.exists() ? otherSnap.data().competitions : {};

        Object.entries({ ...data1, ...data2 }).forEach(([key, value]) => {
          competitions.push({
            id: key,
            name: competitionNamesInArabic[key] || key,
            count: value.count || 0,
            totalPrice: value.totalPrice || 0,
          });
        });

        total = competitions.reduce((sum, c) => sum + c.totalPrice, 0);

        all.push({ name, competitions, total, leaderName });
      }

      setChurchData(all);
      setFilteredChurches(all);
      setLoading(false);
    };

    fetchAllData();
  }, []);

  useEffect(() => {
    const filtered = churchData.filter((c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredChurches(filtered);
  }, [searchTerm, churchData]);

  if (loading) return <p className="church-loading">جاري التحميل...</p>;

  return (
    <div className="church-container">
      <h1 className="church-title">تفاصيل كل الكنائس</h1>

      <input
        type="text"
        placeholder="ابحث عن كنيسة..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          padding: "10px",
          margin: "20px auto",
          display: "block",
          width: "100%",
          maxWidth: "400px",
          borderRadius: "8px",
          border: "1px solid #ccc",
        }}
      />

      <nav style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "10px",
        justifyContent: "center",
        marginBottom: "30px"
      }}>
        {filteredChurches.map((c, idx) => (
          <button
            key={idx}
            onClick={() => {
              document.getElementById(`church-${idx}`)?.scrollIntoView({ behavior: "smooth" });
            }}
            style={{
              padding: "8px 12px",
              backgroundColor: "#4f6ef7",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontSize: "14px",
              cursor: "pointer"
            }}
          >
            {c.name}
          </button>
        ))}
      </nav>

      {filteredChurches.map((church, idx) => {
        const dataForCount = church.competitions.filter(c => c.id !== "festival_subscription" && c.count > 0);
        const dataForPrice = church.competitions.filter(c => c.totalPrice > 0);
        return (
          <div key={idx} id={`church-${idx}`} style={{ marginBottom: "80px" }}>
            <h2 className="church-title">{church.name}</h2>
            <h3 className="church-subtitle">الخادم المسؤول: {church.leaderName || "---"}</h3>

            <div className="church-table-wrapper">
              <table className="church-table">
                <thead>
                  <tr>
                    <th>المسابقة</th>
                    <th>عدد المشتركين</th>
                    <th>السعر الكلي</th>
                  </tr>
                </thead>
                <tbody>
                  {church.competitions.map((c, i) => (
                    <tr key={i}>
                      <td>{c.name}</td>
                      <td>{c.count}</td>
                      <td>{c.totalPrice.toLocaleString()} جـ</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="church-total">
              إجمالي التكلفة: <strong>{church.total.toLocaleString()} جـ</strong>
            </p>

            <div className="church-charts-container">
              <div className="church-chart">
                <h3>نسبة عدد المشتركين</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={dataForCount}
                      dataKey="count"
                      nameKey="name"
                      outerRadius={getResponsiveRadius()}
                    >
                      {dataForCount.map((entry, index) => (
                        <Cell
                          key={`cell-count-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="church-chart">
                <h3>نسبة التكلفة لكل مسابقة</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={dataForPrice}
                      dataKey="totalPrice"
                      nameKey="name"
                      outerRadius={getResponsiveRadius()}
                    >
                      {dataForPrice.map((entry, index) => (
                        <Cell
                          key={`cell-price-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
