"use client";

import dynamic from "next/dynamic";

// استيراد react-select بدون SSR
const Select = dynamic(() => import("react-select"), { ssr: false });

export default function SelectChurch({ options, onChange }) {
  return (
    <Select
      classNamePrefix="church-select"
      options={options}
      onChange={(selectedOption) => onChange(selectedOption?.value || "")}
      placeholder="اختر الكنيسة"
      menuPortalTarget={typeof window !== "undefined" ? document.body : null}
      menuPosition="absolute"
      styles={{
        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
      }}
    />
  );
}
