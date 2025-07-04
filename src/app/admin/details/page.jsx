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
import * as XLSX from "xlsx";
import "./page.css";

const COLORS = [
  "#0088FE", "#00C49F", "#FFBB28", "#FF8042",
  "#b455f0", "#e35f5f", "#40a965", "#f58f00"
];

const competitionNamesInArabic = {
  // نفس الداتا اللي انت كاتبها، متشالة بالكامل ومتسيبتش حاجة.
  "festival_subscription": "إشتراك حجز المهرجان للكنيسة (إلزامى)",
  "rouhi_alex_kindergarten_1": "مرحلة حضانة - الفريق الأول",
  "rouhi_alex_grade1_2_1": "مرحلة أولى وثانية ابتدائي - الفريق الأول",
  "rouhi_alex_grade3_4_1": "مرحلة ثالثة ورابعة ابتدائي - الفريق الأول",
  "rouhi_alex_grade5_6_1": "مرحلة خامسة وسادسة ابتدائي - الفريق الأول",
  "rouhi_alex_kindergarten_extra": "مرحلة حضانة - الفريق الإضافي",
  "rouhi_alex_grade1_2_extra": "مرحلة أولى وثانية ابتدائي - الفريق الإضافي",
  "rouhi_alex_grade3_4_extra": "مرحلة ثالثة ورابعة ابتدائي - الفريق الإضافي",
  "rouhi_alex_grade5_6_extra": "مرحلة خامسة وسادسة ابتدائي - الفريق الإضافي",
  "melodies_level1": "المستوى الأول - فريق",
  "melodies_level2": "المستوى الثاني - فريق",
  "melodies_talented_individual": "مستوى الموهوبين - فردي",
  "melodies_talented_group": "مستوى الموهوبين - جماعي",
  "church_activities_big_theatre": "المسرح الكبير - فريق",
  "church_activities_chorus": "الكورال - فريق",
  "church_activities_cantata": "الكنتاتا - فريق",
  "church_activities_coptic_theatre": "المسرح باللغة القبطية - فريق",
  "church_activities_operetta": "الأوبريت - فريق",
  "church_activities_solo_individual": "مسابقة الصولو - فردي",
  "church_activities_music_individual": "مسابقة العزف - فردي",
  "church_activities_solo_team": "مسابقة الصولو - جماعي",
  "church_activities_music_team": "مسابقة العزف - جماعي",
  "research_theoretical": "البحث النظري - فردي",
  "research_cultural": "البحث الثقافي - فردي",
  "cultural_magazine_paper": "إعداد مجلة ورقية - جماعي",
  "cultural_magazine_wall": "إعداد مجلة حائط - جماعي",
  "cultural_field_visits": "الزيارات الميدانية - جماعي",
  "electronic_level1_individual": " الإلكترونيات المستوى الأول - فردي ",
  "electronic_level2_individual": "الإلكترونيات المستوى الثاني - فردي",
  "electronic_level1_group": " الإلكترونيات المستوى الأول - جماعي",
  "electronic_level2_group": " الإلكترونيات المستوى الثاني - جماعي",
  "arts_kindergarten_individual": " الفنون التشكيلة مرحلة حضانة - فردي",
  "arts_grade1_2_individual": "فنون التشكيلة مرحلة أولى وثانية ابتدائي - فردي",
  "arts_grade3_4_individual": "فنون التشكيلة مرحلة ثالثة ورابعة ابتدائي - فردي",
  "arts_grade5_6_individual": "فنون التشكيلة مرحلة خامسة وسادسة ابتدائي - فردي",
  "arts_kindergarten_group": "فنون التشكيلة مرحلة حضانة - جماعي",
  "arts_grade1_2_group": "فنون التشكيلة مرحلة أولى وثانية ابتدائي - جماعي",
  "arts_grade3_4_group": "فنون التشكيلة مرحلة ثالثة ورابعة ابتدائي - جماعي",
  "arts_grade5_6_group": "فنون التشكيلة مرحلة خامسة وسادسة ابتدائي - جماعي",
  "free_arts_kindergarten_individual": "إبداع حر - حضانة - فردي",
  "free_arts_grade1_2_individual": "إبداع حر - أولى وثانية ابتدائي - فردي",
  "free_arts_grade3_4_individual": "إبداع حر - ثالثة ورابعة ابتدائي - فردي",
  "free_arts_grade5_6_individual": "إبداع حر - خامسة وسادسة ابتدائي - فردي",
  "free_arts_kindergarten_group": "إبداع حر - حضانة - جماعي",
  "free_arts_grade1_2_group": "إبداع حر - أولى وثانية ابتدائي - جماعي",
  "free_arts_grade3_4_group": "إبداع حر - ثالثة ورابعة ابتدائي - جماعي",
  "free_arts_grade5_6_group": "إبداع حر - خامسة وسادسة ابتدائي - جماعي",
  "literary_poetry": "الشعر - فردي",
  "literary_short_story": "القصة القصيرة - فردي",
  "engineering_programming_mechanics_individual": "برمجة وكهرباء وميكانيكا - فردي",
  "engineering_programming_mechanics_group": "برمجة وكهرباء وميكانيكا - جماعي",
  "engineering_architecture_individual": "العمارة - فردي",
  "engineering_architecture_group": "العمارة - جماعي",
  "football_boys": "كرة القدم - بنين",
  "football_girls": "كرة القدم - بنات",
  "volleyball_boys": "الكرة الطائرة - بنين",
  "volleyball_girls": "الكرة الطائرة - بنات",
  "table_tennis_boys_individual": "تنس الطاولة - بنين - فردي",
  "table_tennis_boys_team": "تنس الطاولة - بنين - جماعي",
  "table_tennis_girls_individual": "تنس الطاولة - بنات - فردي",
  "table_tennis_girls_team": "تنس الطاولة - بنات - جماعي",
  "chess_boys_individual": "الشطرنج - بنين - فردي",
  "chess_boys_team": "الشطرنج - بنين - جماعي",
  "chess_girls_individual": "الشطرنج - بنات - فردي",
  "chess_girls_team": "الشطرنج - بنات - جماعي",
  "running_boys": "الجري - بنين - فردي",
  "running_girls": "الجري - بنات - فردي"
};

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
  "كنيسة القديس ابومقار و البابا كيرلس السادس بالدريسة"
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
  const [downloading, setDownloading] = useState(false);

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

const downloadExcel = async () => {
  setDownloading(true); 

  const exportData = [];

  for (let name of churches) {
    let total = 0;
    const churchSnap = await getDoc(doc(db, "church_competitions", name));
    const otherSnap = await getDoc(doc(db, "other-competitions", name));

    const data1 = churchSnap.exists() ? churchSnap.data().competitions : {};
    const data2 = otherSnap.exists() ? otherSnap.data().competitions : {};
    const allCompetitions = { ...data1, ...data2 };

    Object.entries(allCompetitions).forEach(([key, value]) => {
      const count = value.count || 0;
      const price = value.totalPrice || 0;
      total += price;

      exportData.push({
        "الكنيسة": name,
        "المسابقة": competitionNamesInArabic[key] || key,
        "عدد المشاركين": count,
        "السعر الكلي": price,
      });
    });

    exportData.push({
      "الكنيسة": name,
      "المسابقة": "إجمالي تكلفة الكنيسة",
      "عدد المشاركين": "",
      "السعر الكلي": total,
    });

    exportData.push({
      "الكنيسة": "",
      "المسابقة": "",
      "عدد المشاركين": "",
      "السعر الكلي": "",
    });
  }

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "تفاصيل الكنائس");
  XLSX.writeFile(workbook, "تفاصيل_الكنائس.xlsx");

  setDownloading(false); 
};






  if (loading) return <p className="church-loading">جاري التحميل...</p>;

  return (
    <div className="church-container">
      <h1 className="church-title">تفاصيل كل الكنائس</h1>

<button
  onClick={downloadExcel}
  disabled={downloading}
  style={{
    background: downloading ? "#6c757d" : "#4f6ef7",
    color: "white",
    padding: "10px 16px",
    border: "none",
    borderRadius: "8px",
    cursor: downloading ? "not-allowed" : "pointer",
    display: "block",
    margin: "0 auto 20px auto",
    fontSize: "16px",
    fontWeight: "bold",
    transition: "all 0.3s ease",
  }}
>
  {downloading ? "⏳ Downloading" : "⬇ download Excel"}
</button>



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
