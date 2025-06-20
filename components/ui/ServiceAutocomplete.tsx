import React from 'react';

interface ServiceOption {
  service: string;
  description?: string;
  cost: Array<{
    value: number;
    etd: string;
  }>;
}

interface ServiceAutocompleteProps {
  options: ServiceOption[];
  value: ServiceOption | null;
  onChange: (option: ServiceOption | null) => void;
  placeholder?: string;
}

const ServiceAutocomplete: React.FC<ServiceAutocompleteProps> = ({ options, value, onChange, placeholder }) => {
  const [inputValue, setInputValue] = React.useState(value ? value.service : '');
  const [showDropdown, setShowDropdown] = React.useState(false);

  const filteredOptions = options.filter(option =>
    option.service.toLowerCase().includes(inputValue.toLowerCase()) ||
    (option.description && option.description.toLowerCase().includes(inputValue.toLowerCase()))
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setShowDropdown(true);
  };

  const handleSelect = (option: ServiceOption) => {
    setInputValue(option.service);
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
        placeholder={placeholder || 'Cari layanan pengiriman...'}
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => setShowDropdown(true)}
        onBlur={handleBlur}
        autoComplete="off"
      />
      {showDropdown && filteredOptions.length > 0 && (
        <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-xl mt-1 max-h-60 overflow-y-auto shadow-lg">
          {filteredOptions.map((option, idx) => (
            <div
              key={option.service + idx}
              className="px-4 py-2 cursor-pointer hover:bg-blue-50"
              onClick={() => handleSelect(option)}
            >
              <div className="font-medium">{option.service}</div>
              <div className="text-xs text-gray-500">{option.description || ''} Estimasi: {option.cost[0]?.etd} hari</div>
              <div className="text-xs text-black font-semibold">Rp{option.cost[0]?.value?.toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ServiceAutocomplete; 