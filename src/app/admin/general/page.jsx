// ✅ File: app/admin/general/page.jsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  getDoc,
  doc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "./page.css";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28EF5", "#FF6F91", "#82CA9D"];
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

export default function GeneralStatsPage() {
  const [loading, setLoading] = useState(true);
  const [mostPopular, setMostPopular] = useState([]);
  const [mostPaid, setMostPaid] = useState([]);
  const [churchSubscribers, setChurchSubscribers] = useState([]);
  const [churchPayments, setChurchPayments] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return router.push("/register");
      const userDoc = await getDoc(doc(db, "leaders", user.uid));
      const userData = userDoc.data();
      if (!userDoc.exists()) return router.push("/register");
      if (!userData.approved) return router.push("/waiting");
      if (userData.role !== "admin") return router.push("/leader/profile");

      await fetchData();
    });
    return () => unsubscribe();
  }, []);

  const fetchData = async () => {
    const sportSnap = await getDocs(collection(db, "church_competitions"));
    const otherSnap = await getDocs(collection(db, "other-competitions"));
    const allComps = [...sportSnap.docs, ...otherSnap.docs];

    const popularity = {};
    const payments = {};
    const churchSubs = {};
    const churchPays = {};
    
    allComps.forEach((docSnap) => {
      const church = docSnap.id;
      const data = docSnap.data();
      const comps = data.competitions || {};

      Object.entries(comps).forEach(([name, values]) => {
        const count = values.count || 0;
        const price = values.totalPrice || 0;

        popularity[name] = (popularity[name] || 0) + count;
        payments[name] = (payments[name] || 0) + price;
        churchSubs[church] = (churchSubs[church] || 0) + count;
        churchPays[church] = (churchPays[church] || 0) + price;
      });
    });

    setMostPopular(
      Object.entries(popularity).map(([name, value]) => ({
        name: competitionNamesInArabic[name] || name,
        value,
      }))
    );
    setMostPaid(
      Object.entries(payments).map(([name, value]) => ({
        name: competitionNamesInArabic[name] || name,
        value,
      }))
    );
    setChurchSubscribers(
      Object.entries(churchSubs).map(([name, value]) => ({ name, value }))
    );
    setChurchPayments(
      Object.entries(churchPays).map(([name, value]) => ({ name, value }))
    );
    setLoading(false);
  };

  if (loading) return <p className="ad-gen-loading">جاري تحميل الإحصائيات...</p>;
  const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  outerRadius,
  name,
  value,
}) => {
  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 30; // نزود المسافة شوية
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  const displayName = competitionNamesInArabic[name] || name;

  return (
    <text
      x={x}
      y={y}
      fill="#444"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      style={{
        fontSize: "13px",
        fontWeight: "600",
        backgroundColor: "white",
      }}
    >
      {`${displayName}: ${value}`}
    </text>
  );
};

  const renderChart = (title, data) => (
    <div className="ad-gen-chart-box">
      <h2 className="ad-gen-chart-title">{title}</h2>
      
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
  data={data}
  dataKey="value"
  nameKey="name"
  outerRadius={120}
  cx="50%"
  cy="50%"
  label={false}
  labelLine={false}>
  {data.map((entry, index) => (
    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
  ))}
</Pie>

          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );

  return (
    <div className="ad-gen-container">
      <h1 className="ad-gen-title">إحصائيات عامة للكرازة</h1>
      <div className="ad-gen-grid">
        {renderChart("أكثر المسابقات انتشارًا", mostPopular)}
        {renderChart("أكثر المسابقات تكلفة", mostPaid)}
        {renderChart("أكثر الكنائس مشاركة", churchSubscribers)}
        {renderChart("إجمالي المبالغ المطلوبة من الكنائس", churchPayments)}
      </div>
    </div>
  );
}
