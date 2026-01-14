import React, { useEffect, useState, Fragment } from 'react';
import { Combobox, Transition } from '@headlessui/react';
import { Check, ChevronDown, Search } from 'lucide-react';
import {
  useGetDivisionsQuery,
  useGetDistrictsQuery,
  useGetUpazilasQuery,
  useGetUnionsQuery,
} from '../../store/slices/apiSlice';
import { formatLocationName } from '../../utils/addressFormatter';

/**
 * SearchableCombobox - Reusable searchable dropdown component
 */
const SearchableCombobox = ({
  value,
  onChange,
  options = [],
  placeholder,
  disabled,
  error,
  language = 'en',
  loading = false,
}) => {
  const [query, setQuery] = useState('');

  const filteredOptions =
    query === ''
      ? options
      : options.filter((option) => {
          const name = formatLocationName(option, language).toLowerCase();
          return name.includes(query.toLowerCase());
        });

  const selectedOption = options.find((opt) => (opt.id || opt._id) === value);
  const displayValue = selectedOption ? formatLocationName(selectedOption, language) : '';

  return (
    <Combobox value={value} onChange={onChange} disabled={disabled}>
      <div className="relative">
        <div className="relative">
          <Combobox.Input
            className={`w-full pl-10 pr-10 py-3 rounded-xl border-2 transition-all duration-200
              ${
                error
                  ? 'border-tomato-red/30 bg-tomato-red/5 focus:border-tomato-red/50 focus:ring-2 focus:ring-tomato-red/10'
                  : 'border-gray-200 bg-white focus:border-mint-fresh focus:ring-2 focus:ring-mint-fresh/10'
              }
              ${disabled ? 'bg-gray-50 cursor-not-allowed text-gray-400' : 'cursor-text'}
              focus:outline-none`}
            displayValue={() => displayValue}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={loading ? 'Loading...' : placeholder}
            disabled={disabled || loading}
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <Search className="w-5 h-5" />
          </div>
          <Combobox.Button className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <ChevronDown className="w-5 h-5 text-gray-400" />
          </Combobox.Button>
        </div>

        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          afterLeave={() => setQuery('')}
        >
          <Combobox.Options className="absolute z-10 mt-2 w-full max-h-60 overflow-auto rounded-xl bg-white border-2 border-gray-200 shadow-lg focus:outline-none">
            {filteredOptions.length === 0 && query !== '' ? (
              <div className="relative cursor-default select-none py-3 px-4 text-gray-500 text-sm">
                No results found for "{query}"
              </div>
            ) : filteredOptions.length === 0 ? (
              <div className="relative cursor-default select-none py-3 px-4 text-gray-500 text-sm">
                {loading ? 'Loading...' : 'No options available'}
              </div>
            ) : (
              filteredOptions.map((option) => (
                <Combobox.Option
                  key={option.id || option._id}
                  className={({ active }) =>
                    `relative cursor-pointer select-none py-3 pl-10 pr-4 transition-colors duration-150
                    ${active ? 'bg-mint-fresh/10 text-bottle-green' : 'text-gray-900'}`
                  }
                  value={option.id || option._id}
                >
                  {({ selected, active }) => (
                    <>
                      <span
                        className={`block truncate ${selected ? 'font-semibold' : 'font-normal'}`}
                      >
                        {formatLocationName(option, language)}
                      </span>
                      {selected && (
                        <span
                          className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                            active ? 'text-bottle-green' : 'text-mint-fresh'
                          }`}
                        >
                          <Check className="w-5 h-5" />
                        </span>
                      )}
                    </>
                  )}
                </Combobox.Option>
              ))
            )}
          </Combobox.Options>
        </Transition>
      </div>
    </Combobox>
  );
};

/**
 * ControlledBDAddressForm Component
 * Controlled form component for Bangladesh hierarchical address input
 * Works with useState instead of React Hook Form
 *
 * @param {Object} address - Address object with division, district, upazila, union, street, landmark, postalCode
 * @param {Function} onChange - Callback function called when any field changes: onChange(fieldName, value)
 * @param {Function} onAddressChange - Alternative: callback with full address object: onAddressChange(newAddress)
 * @param {Object} errors - Error messages object {division: 'error', district: 'error', ...}
 * @param {Boolean} disabled - Disable all fields
 * @param {Boolean} required - Make fields required (default: true)
 * @param {Boolean} includeUnion - Show union dropdown (default: true)
 * @param {Boolean} includeLandmark - Show landmark field (default: true)
 * @param {String} language - Default language 'en' or 'bn' (default: 'en')
 * @param {Boolean} showLanguageToggle - Show language toggle button (default: false)
 */
const ControlledBDAddressForm = ({
  address = {
    division: '',
    district: '',
    upazila: '',
    union: '',
    street: '',
    landmark: '',
    postalCode: '',
  },
  onChange,
  onAddressChange,
  errors = {},
  disabled = false,
  required = true,
  includeUnion = true,
  includeLandmark = true,
  language: initialLanguage = 'en',
  showLanguageToggle = false,
}) => {
  const [language, setLanguage] = useState(initialLanguage);

  // Fetch location data using RTK Query
  const { data: divisions, isLoading: loadingDivisions } = useGetDivisionsQuery({ lang: language });
  const { data: districts, isLoading: loadingDistricts } = useGetDistrictsQuery(
    { divisionId: address.division, lang: language },
    { skip: !address.division }
  );
  const { data: upazilas, isLoading: loadingUpazilas } = useGetUpazilasQuery(
    { districtId: address.district, lang: language },
    { skip: !address.district }
  );
  const { data: unions, isLoading: loadingUnions } = useGetUnionsQuery(
    { upazilaId: address.upazila, lang: language },
    { skip: !address.upazila || !includeUnion }
  );

  // Handle field change
  const handleFieldChange = (fieldName, value) => {
    // Call individual field onChange if provided
    if (onChange) {
      onChange(fieldName, value);
    }

    // Call onAddressChange with full updated address if provided
    if (onAddressChange) {
      const updatedAddress = { ...address, [fieldName]: value };

      // Reset child fields when parent changes
      if (fieldName === 'division') {
        updatedAddress.district = '';
        updatedAddress.upazila = '';
        updatedAddress.union = '';
      } else if (fieldName === 'district') {
        updatedAddress.upazila = '';
        updatedAddress.union = '';
      } else if (fieldName === 'upazila') {
        updatedAddress.union = '';
      }

      onAddressChange(updatedAddress);
    }
  };

  // Toggle language
  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'bn' : 'en');
  };

  // Input field class
  const inputClass = (hasError) =>
    `w-full px-4 py-3 rounded-xl border-2 transition-all duration-200
    ${
      hasError
        ? 'border-tomato-red/30 bg-tomato-red/5 focus:border-tomato-red/50 focus:ring-2 focus:ring-tomato-red/10'
        : 'border-gray-200 bg-white focus:border-mint-fresh focus:ring-2 focus:ring-mint-fresh/10'
    }
    disabled:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-400 focus:outline-none`;

  // Label class
  const labelClass = 'block text-sm font-medium text-text-dark mb-2';

  // Error message class
  const errorClass = 'text-tomato-red/80 text-sm mt-2 flex items-center gap-2 animate-fade-in';

  return (
    <div className="space-y-6">
      {/* Language Toggle */}
      {showLanguageToggle && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-earthy-yellow/20 hover:bg-earthy-yellow/30 text-earthy-brown font-medium transition-all duration-200"
          >
            <span>{language === 'en' ? 'English' : 'বাংলা'}</span>
            <span className="text-xs">({language === 'en' ? 'Switch to বাংলা' : 'Switch to English'})</span>
          </button>
        </div>
      )}

      {/* Division */}
      <div>
        <label className={labelClass}>
          Division {language === 'bn' && '(বিভাগ)'}
          {required && <span className="text-tomato-red ml-1">*</span>}
        </label>
        <SearchableCombobox
          value={address.division}
          onChange={(value) => handleFieldChange('division', value)}
          options={divisions || []}
          placeholder="Search or select division..."
          disabled={disabled || loadingDivisions}
          error={errors.division}
          language={language}
          loading={loadingDivisions}
        />
        {errors.division && <p className={errorClass}>{errors.division}</p>}
      </div>

      {/* District */}
      <div>
        <label className={labelClass}>
          District {language === 'bn' && '(জেলা)'}
          {required && <span className="text-tomato-red ml-1">*</span>}
        </label>
        <SearchableCombobox
          value={address.district}
          onChange={(value) => handleFieldChange('district', value)}
          options={districts || []}
          placeholder={
            !address.division
              ? 'Select division first'
              : loadingDistricts
              ? 'Loading districts...'
              : 'Search or select district...'
          }
          disabled={disabled || !address.division || loadingDistricts}
          error={errors.district}
          language={language}
          loading={loadingDistricts}
        />
        {errors.district && <p className={errorClass}>{errors.district}</p>}
      </div>

      {/* Upazila */}
      <div>
        <label className={labelClass}>
          Upazila {language === 'bn' && '(উপজেলা)'}
          {required && <span className="text-tomato-red ml-1">*</span>}
        </label>
        <SearchableCombobox
          value={address.upazila}
          onChange={(value) => handleFieldChange('upazila', value)}
          options={upazilas || []}
          placeholder={
            !address.district
              ? 'Select district first'
              : loadingUpazilas
              ? 'Loading upazilas...'
              : 'Search or select upazila...'
          }
          disabled={disabled || !address.district || loadingUpazilas}
          error={errors.upazila}
          language={language}
          loading={loadingUpazilas}
        />
        {errors.upazila && <p className={errorClass}>{errors.upazila}</p>}
      </div>

      {/* Union (Optional) */}
      {includeUnion && (
        <div>
          <label className={labelClass}>
            Union/Ward {language === 'bn' && '(ইউনিয়ন/ওয়ার্ড)'}{' '}
            <span className="text-gray-400 text-xs">(Optional)</span>
          </label>
          <SearchableCombobox
            value={address.union}
            onChange={(value) => handleFieldChange('union', value)}
            options={unions || []}
            placeholder={
              !address.upazila
                ? 'Select upazila first'
                : loadingUnions
                ? 'Loading unions...'
                : 'Search or select union/ward (optional)...'
            }
            disabled={disabled || !address.upazila || loadingUnions}
            error={errors.union}
            language={language}
            loading={loadingUnions}
          />
          {errors.union && <p className={errorClass}>{errors.union}</p>}
        </div>
      )}

      {/* Street Address */}
      <div>
        <label className={labelClass}>
          Street Address {language === 'bn' && '(রাস্তার ঠিকানা)'}
          {required && <span className="text-tomato-red ml-1">*</span>}
        </label>
        <input
          type="text"
          value={address.street || ''}
          onChange={(e) => handleFieldChange('street', e.target.value)}
          placeholder="e.g., House 12, Road 5, Block A"
          className={inputClass(errors.street)}
          disabled={disabled}
        />
        {errors.street && <p className={errorClass}>{errors.street}</p>}
      </div>

      {/* Landmark (Optional) */}
      {includeLandmark && (
        <div>
          <label className={labelClass}>
            Landmark {language === 'bn' && '(নিকটবর্তী স্থান)'}{' '}
            <span className="text-gray-400 text-xs">(Optional)</span>
          </label>
          <input
            type="text"
            value={address.landmark || ''}
            onChange={(e) => handleFieldChange('landmark', e.target.value)}
            placeholder="e.g., Near Jamuna Future Park"
            className={inputClass(errors.landmark)}
            disabled={disabled}
          />
          {errors.landmark && <p className={errorClass}>{errors.landmark}</p>}
        </div>
      )}

      {/* Postal Code */}
      <div>
        <label className={labelClass}>
          Postal Code {language === 'bn' && '(পোস্ট কোড)'}
          {required && <span className="text-tomato-red ml-1">*</span>}
        </label>
        <input
          type="text"
          value={address.postalCode || ''}
          onChange={(e) => handleFieldChange('postalCode', e.target.value)}
          placeholder="e.g., 1212"
          maxLength={4}
          className={inputClass(errors.postalCode)}
          disabled={disabled}
        />
        {errors.postalCode && <p className={errorClass}>{errors.postalCode}</p>}
      </div>
    </div>
  );
};

export default ControlledBDAddressForm;
