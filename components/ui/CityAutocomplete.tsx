import React, { useState, useRef } from 'react';

interface CityOption {
  id: number;
  label: string;
  subdistrict_name: string;
  district_name: string;
  city_name: string;
  province_name: string;
  zip_code: string;
}

interface CityAutocompleteProps {
  value: CityOption | null;
  onChange: (option: CityOption | null) => void;
  placeholder?: string;
}

const CityAutocomplete: React.FC<CityAutocompleteProps> = ({ value, onChange, placeholder }) => {
  const [inputValue, setInputValue] = useState(value ? value.label : '');
  const [options, setOptions] = useState<CityOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchOptions = async (keyword: string) => {
    if (!keyword || keyword.length < 3) {
      setOptions([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/shipping/search-destination?keyword=${encodeURIComponent(keyword)}`);
      const data = await res.json();
      if (data.data && Array.isArray(data.data)) {
        setOptions(data.data);
      } else {
        setOptions([]);
      }
    } catch (e) {
      setOptions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    setShowDropdown(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      fetchOptions(val);
    }, 400);
  };

  const handleSelect = (option: CityOption) => {
    setInputValue(option.label);
    setShowDropdown(false);
    onChange(option);
  };

  const handleBlur = () => {
    setTimeout(() => setShowDropdown(false), 200);
  };

  return (
    <div className="relative w-full">
      <input
        type="text"
        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder={placeholder || 'Cari kota/kecamatan/kelurahan...'}
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => setShowDropdown(true)}
        onBlur={handleBlur}
        autoComplete="off"
      />
      {showDropdown && options.length > 0 && (
        <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-xl mt-1 max-h-60 overflow-y-auto shadow-lg">
          {options.map((option) => (
            <div
              key={option.id}
              className="px-4 py-2 cursor-pointer hover:bg-blue-50"
              onClick={() => handleSelect(option)}
            >
              <div className="font-medium">{option.label}</div>
              <div className="text-xs text-gray-500">
                {option.subdistrict_name}, {option.district_name}, {option.city_name}, {option.province_name} {option.zip_code && `(${option.zip_code})`}
              </div>
            </div>
          ))}
        </div>
      )}
      {loading && (
        <div className="absolute right-3 top-3">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};

export default CityAutocomplete; 