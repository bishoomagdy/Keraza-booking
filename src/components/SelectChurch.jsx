import Select from "react-select";

export default function SelectChurch({ options, onChange }) {
  return (
    <Select
      classNamePrefix="church-select"
      options={options}
      onChange={(selectedOption) => onChange(selectedOption?.value || "")}
      placeholder="اختر الكنيسة"
      menuPortalTarget={document.body}
      menuPosition="absolute"
      styles={{
        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
      }}
    />
  );
}
