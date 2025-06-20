import React, { useState, useEffect } from 'react';

interface CourierOption {
  code: string;
  name: string;
}

interface CourierAutocompleteProps {
  value: CourierOption | null;
  onChange: (option: CourierOption | null) => void;
  placeholder?: string;
}

const CourierAutocomplete: React.FC<CourierAutocompleteProps> = ({ value, onChange, placeholder }) => {
  const [inputValue, setInputValue] = useState(value ? value.name : '');
  const [options, setOptions] = useState<CourierOption[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    fetch('/api/shipping/couriers')
      .then(res => res.json())
      .then(data => setOptions(Array.isArray(data) ? data : []));
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    setShowDropdown(true);
  };

  const filteredOptions = options.filter(option =>
    option.name.toLowerCase().includes(inputValue.toLowerCase()) ||
    option.code.toLowerCase().includes(inputValue.toLowerCase())
  );

  const handleSelect = (option: CourierOption) => {
    setInputValue(option.name);
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
        placeholder={placeholder || 'Cari kurir...'}
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => setShowDropdown(true)}
        onBlur={handleBlur}
        autoComplete="off"
      />
      {showDropdown && filteredOptions.length > 0 && (
        <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-xl mt-1 max-h-60 overflow-y-auto shadow-lg">
          {filteredOptions.map((option) => (
            <div
              key={option.code}
              className="px-4 py-2 cursor-pointer hover:bg-blue-50"
              onClick={() => handleSelect(option)}
            >
              <div className="font-medium">{option.name}</div>
              <div className="text-xs text-gray-500">{option.code}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourierAutocomplete; 