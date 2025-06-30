"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
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

// ألوان الشارت
const COLORS = [
  "#0088FE", "#00C49F", "#FFBB28", "#FF8042",
  "#b455f0", "#e35f5f", "#40a965", "#f58f00"
];

// خريطة أسماء المسابقات بالعربي
const competitionNamesInArabic = {
  // اشتراك المهرجان
  "festival_subscription": "إشتراك حجز المهرجان للكنيسة (إلزامى)",

  // روحى الإسكندرية
  "rouhi_alex_kindergarten_1": "مرحلة حضانة - الفريق الأول",
  "rouhi_alex_grade1_2_1": "مرحلة أولى وثانية ابتدائي - الفريق الأول",
  "rouhi_alex_grade3_4_1": "مرحلة ثالثة ورابعة ابتدائي - الفريق الأول",
  "rouhi_alex_grade5_6_1": "مرحلة خامسة وسادسة ابتدائي - الفريق الأول",
  "rouhi_alex_kindergarten_extra": "مرحلة حضانة - الفريق الإضافي",
  "rouhi_alex_grade1_2_extra": "مرحلة أولى وثانية ابتدائي - الفريق الإضافي",
  "rouhi_alex_grade3_4_extra": "مرحلة ثالثة ورابعة ابتدائي - الفريق الإضافي",
  "rouhi_alex_grade5_6_extra": "مرحلة خامسة وسادسة ابتدائي - الفريق الإضافي",

  // الألحان والتسبحة
  "melodies_level1": "المستوى الأول - فريق",
  "melodies_level2": "المستوى الثاني - فريق",
  "melodies_talented_individual": "مستوى الموهوبين - فردي",
  "melodies_talented_group": "مستوى الموهوبين - جماعي",

  // الأنشطة الكنسية
  "church_activities_big_theatre": "المسرح الكبير - فريق",
  "church_activities_chorus": "الكورال - فريق",
  "church_activities_cantata": "الكنتاتا - فريق",
  "church_activities_coptic_theatre": "المسرح باللغة القبطية - فريق",
  "church_activities_operetta": "الأوبريت - فريق",
  "church_activities_solo_individual": "مسابقة الصولو - فردي",
  "church_activities_music_individual": "مسابقة العزف - فردي",
  "church_activities_solo_team": "مسابقة الصولو - جماعي",
  "church_activities_music_team": "مسابقة العزف - جماعي",

  // البحوث
  "research_theoretical": "البحث النظري - فردي",
  "research_cultural": "البحث الثقافي - فردي",

  // الثقافية
  "cultural_magazine_paper": "إعداد مجلة ورقية - جماعي",
  "cultural_magazine_wall": "إعداد مجلة حائط - جماعي",
  "cultural_field_visits": "الزيارات الميدانية - جماعي",

  // الإلكترونية
  "electronic_level1_individual": " الإلكترونيات المستوى الأول - فردي ",
  "electronic_level2_individual": "الإلكترونيات المستوى الثاني - فردي",
  "electronic_level1_group": " الإلكترونيات المستوى الأول - جماعي",
  "electronic_level2_group": " الإلكترونيات المستوى الثاني - جماعي",

  // الفنون التشكيلية
  "arts_kindergarten_individual": " الفنون التشكيلة مرحلة حضانة - فردي",
  "arts_grade1_2_individual": "فنون التشكيلة مرحلة أولى وثانية ابتدائي - فردي",
  "arts_grade3_4_individual": "فنون التشكيلة مرحلة ثالثة ورابعة ابتدائي - فردي",
  "arts_grade5_6_individual": "فنون التشكيلة مرحلة خامسة وسادسة ابتدائي - فردي",
  "arts_kindergarten_group": "فنون التشكيلة مرحلة حضانة - جماعي",
  "arts_grade1_2_group": "فنون التشكيلة مرحلة أولى وثانية ابتدائي - جماعي",
  "arts_grade3_4_group": "فنون التشكيلة مرحلة ثالثة ورابعة ابتدائي - جماعي",
  "arts_grade5_6_group": "فنون التشكيلة مرحلة خامسة وسادسة ابتدائي - جماعي",

  // الفنون التشكيلية - إبداع حر
  "free_arts_kindergarten_individual": "إبداع حر - حضانة - فردي",
  "free_arts_grade1_2_individual": "إبداع حر - أولى وثانية ابتدائي - فردي",
  "free_arts_grade3_4_individual": "إبداع حر - ثالثة ورابعة ابتدائي - فردي",
  "free_arts_grade5_6_individual": "إبداع حر - خامسة وسادسة ابتدائي - فردي",
  "free_arts_kindergarten_group": "إبداع حر - حضانة - جماعي",
  "free_arts_grade1_2_group": "إبداع حر - أولى وثانية ابتدائي - جماعي",
  "free_arts_grade3_4_group": "إبداع حر - ثالثة ورابعة ابتدائي - جماعي",
  "free_arts_grade5_6_group": "إبداع حر - خامسة وسادسة ابتدائي - جماعي",

  // الأدبية
  "literary_poetry": "الشعر - فردي",
  "literary_short_story": "القصة القصيرة - فردي",

  // الهندسية
  "engineering_programming_mechanics_individual": "برمجة وكهرباء وميكانيكا - فردي",
  "engineering_programming_mechanics_group": "برمجة وكهرباء وميكانيكا - جماعي",
  "engineering_architecture_individual": "العمارة - فردي",
  "engineering_architecture_group": "العمارة - جماعي",

  // الرياضية
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
  "running_girls": "الجري - بنات - فردي",
};

export default function ChurchInfoPage() {
  const [churchName, setChurchName] = useState("");
  const [leaderName, setLeaderName] = useState("");
  const [allCompetitions, setAllCompetitions] = useState([]);
  const [totalPayment, setTotalPayment] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setError("يجب تسجيل الدخول.");
        setLoading(false);
        return;
      }

      try {
        const leaderRef = doc(db, "leaders", user.uid);
        const leaderSnap = await getDoc(leaderRef);
        if (!leaderSnap.exists()) {
          setError("بيانات الخادم غير موجودة.");
          setLoading(false);
          return;
        }

        const leaderData = leaderSnap.data();
        const church = leaderData.church;
        const name = leaderData.firstName + " " + leaderData.lastName;
        setChurchName(church);
        setLeaderName(name);

        const competitions = [];

        // بيانات مسابقات الكنيسة
        const churchDoc = await getDoc(doc(db, "church_competitions", church));
        if (churchDoc.exists()) {
          const data = churchDoc.data().competitions || {};
          Object.entries(data).forEach(([key, value]) => {
            competitions.push({
              id: key,
              name: competitionNamesInArabic[key] || value.name || key,
              count: value.count || 0,
              totalPrice: value.totalPrice || 0,
            });
          });
        }

        // بيانات مسابقات أخرى
        const otherDoc = await getDoc(doc(db, "other-competitions", church));
        if (otherDoc.exists()) {
          const data = otherDoc.data().competitions || {};
          Object.entries(data).forEach(([key, value]) => {
            competitions.push({
              id: key,
              name: competitionNamesInArabic[key] || value.name || key,
              count: value.count || 0,
              totalPrice: value.totalPrice || 0,
            });
          });
        }

        const total = competitions.reduce(
          (acc, item) => acc + item.totalPrice,
          0
        );
        setAllCompetitions(competitions);
        setTotalPayment(total);
      } catch (err) {
        console.error(err);
        setError("حدث خطأ أثناء تحميل البيانات.");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <p className="church-loading">جاري التحميل...</p>;
  if (error) return <p className="church-error">{error}</p>;

  const dataForCount = allCompetitions.filter(
    (c) => c.id !== "festival_subscription" && c.count > 0
  );
  const dataForPrice = allCompetitions.filter((c) => c.totalPrice > 0);

  return (
    <div className="church-container">
      <h1 className="church-title">{churchName}</h1>
      <h2 className="church-subtitle">الخادم المسؤول: {leaderName}</h2>

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
            {allCompetitions.map((c, index) => (
              <tr key={index}>
                <td>{c.name}</td>
                <td>{c.count}</td>
                <td>{c.totalPrice.toLocaleString()} جـ</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="church-total">
        إجمالي التكلفة: <strong>{totalPayment.toLocaleString()} جـ</strong>
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
                outerRadius={100}
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
                outerRadius={100}
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
}
