import React, { useEffect, useState, Fragment } from 'react';
import { Controller } from 'react-hook-form';
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
 * BDAddressForm Component
 * Reusable form component for Bangladesh hierarchical address input
 * with searchable cascading dropdowns (Division → District → Upazila → Union)
 *
 * @param {Object} control - React Hook Form control object
 * @param {Object} errors - React Hook Form errors object
 * @param {Function} setValue - React Hook Form setValue function
 * @param {Function} watch - React Hook Form watch function
 * @param {String} name - Field name prefix (default: "address")
 * @param {Boolean} required - Make fields required (default: true)
 * @param {Boolean} includeUnion - Show union dropdown (default: true)
 * @param {Boolean} includeLandmark - Show landmark field (default: true)
 * @param {String} language - Default language 'en' or 'bn' (default: 'en')
 * @param {Boolean} showLanguageToggle - Show language toggle button (default: false)
 */
const BDAddressForm = ({
  control,
  errors = {},
  setValue,
  watch,
  name = 'address',
  required = true,
  includeUnion = true,
  includeLandmark = true,
  language: initialLanguage = 'en',
  showLanguageToggle = false,
}) => {
  const [language, setLanguage] = useState(initialLanguage);

  // Watch form values for cascading logic
  const division = watch(`${name}.division`);
  const district = watch(`${name}.district`);
  const upazila = watch(`${name}.upazila`);

  // Fetch location data using RTK Query
  const { data: divisions, isLoading: loadingDivisions } = useGetDivisionsQuery({ lang: language });
  const { data: districts, isLoading: loadingDistricts } = useGetDistrictsQuery(
    { divisionId: division, lang: language },
    { skip: !division }
  );
  const { data: upazilas, isLoading: loadingUpazilas } = useGetUpazilasQuery(
    { districtId: district, lang: language },
    { skip: !district }
  );
  const { data: unions, isLoading: loadingUnions } = useGetUnionsQuery(
    { upazilaId: upazila, lang: language },
    { skip: !upazila || !includeUnion }
  );

  // Reset child fields when parent changes
  useEffect(() => {
    if (division) {
      setValue(`${name}.district`, '');
      setValue(`${name}.upazila`, '');
      setValue(`${name}.union`, '');
    }
  }, [division, name, setValue]);

  useEffect(() => {
    if (district) {
      setValue(`${name}.upazila`, '');
      setValue(`${name}.union`, '');
    }
  }, [district, name, setValue]);

  useEffect(() => {
    if (upazila && includeUnion) {
      setValue(`${name}.union`, '');
    }
  }, [upazila, name, setValue, includeUnion]);

  // Handle language toggle
  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'bn' : 'en');
  };

  // Get error message for a field
  const getError = (fieldName) => {
    const fullPath = `${name}.${fieldName}`;
    const pathParts = fullPath.split('.');
    let error = errors;
    for (const part of pathParts) {
      if (error && error[part]) {
        error = error[part];
      } else {
        return null;
      }
    }
    return error;
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

      {/* Division Searchable Dropdown */}
      <div>
        <label htmlFor={`${name}.division`} className={labelClass}>
          Division {language === 'bn' && '(বিভাগ)'}
          {required && <span className="text-tomato-red ml-1">*</span>}
        </label>
        <Controller
          name={`${name}.division`}
          control={control}
          rules={required ? { required: 'Division is required' } : {}}
          render={({ field }) => (
            <SearchableCombobox
              value={field.value}
              onChange={field.onChange}
              options={divisions || []}
              placeholder="Search or select division..."
              disabled={loadingDivisions}
              error={getError('division')}
              language={language}
              loading={loadingDivisions}
            />
          )}
        />
        {getError('division') && (
          <p className={errorClass}>{getError('division').message}</p>
        )}
      </div>

      {/* District Searchable Dropdown */}
      <div>
        <label htmlFor={`${name}.district`} className={labelClass}>
          District {language === 'bn' && '(জেলা)'}
          {required && <span className="text-tomato-red ml-1">*</span>}
        </label>
        <Controller
          name={`${name}.district`}
          control={control}
          rules={required ? { required: 'District is required' } : {}}
          render={({ field }) => (
            <SearchableCombobox
              value={field.value}
              onChange={field.onChange}
              options={districts || []}
              placeholder={
                !division
                  ? 'Select division first'
                  : loadingDistricts
                  ? 'Loading districts...'
                  : 'Search or select district...'
              }
              disabled={!division || loadingDistricts}
              error={getError('district')}
              language={language}
              loading={loadingDistricts}
            />
          )}
        />
        {getError('district') && (
          <p className={errorClass}>{getError('district').message}</p>
        )}
      </div>

      {/* Upazila Searchable Dropdown */}
      <div>
        <label htmlFor={`${name}.upazila`} className={labelClass}>
          Upazila {language === 'bn' && '(উপজেলা)'}
          {required && <span className="text-tomato-red ml-1">*</span>}
        </label>
        <Controller
          name={`${name}.upazila`}
          control={control}
          rules={required ? { required: 'Upazila is required' } : {}}
          render={({ field }) => (
            <SearchableCombobox
              value={field.value}
              onChange={field.onChange}
              options={upazilas || []}
              placeholder={
                !district
                  ? 'Select district first'
                  : loadingUpazilas
                  ? 'Loading upazilas...'
                  : 'Search or select upazila...'
              }
              disabled={!district || loadingUpazilas}
              error={getError('upazila')}
              language={language}
              loading={loadingUpazilas}
            />
          )}
        />
        {getError('upazila') && (
          <p className={errorClass}>{getError('upazila').message}</p>
        )}
      </div>

      {/* Union Searchable Dropdown (Optional) */}
      {includeUnion && (
        <div>
          <label htmlFor={`${name}.union`} className={labelClass}>
            Union/Ward {language === 'bn' && '(ইউনিয়ন/ওয়ার্ড)'}{' '}
            <span className="text-gray-400 text-xs">(Optional)</span>
          </label>
          <Controller
            name={`${name}.union`}
            control={control}
            render={({ field }) => (
              <SearchableCombobox
                value={field.value}
                onChange={field.onChange}
                options={unions || []}
                placeholder={
                  !upazila
                    ? 'Select upazila first'
                    : loadingUnions
                    ? 'Loading unions...'
                    : 'Search or select union/ward (optional)...'
                }
                disabled={!upazila || loadingUnions}
                error={getError('union')}
                language={language}
                loading={loadingUnions}
              />
            )}
          />
          {getError('union') && (
            <p className={errorClass}>{getError('union').message}</p>
          )}
        </div>
      )}

      {/* Street Address */}
      <div>
        <label htmlFor={`${name}.street`} className={labelClass}>
          Street Address {language === 'bn' && '(রাস্তার ঠিকানা)'}
          {required && <span className="text-tomato-red ml-1">*</span>}
        </label>
        <Controller
          name={`${name}.street`}
          control={control}
          rules={
            required
              ? {
                  required: 'Street address is required',
                  minLength: { value: 5, message: 'Street address must be at least 5 characters' },
                  maxLength: { value: 200, message: 'Street address cannot exceed 200 characters' },
                }
              : {}
          }
          render={({ field }) => (
            <input
              {...field}
              type="text"
              id={`${name}.street`}
              placeholder="e.g., House 12, Road 5, Block A"
              className={inputClass(getError('street'))}
            />
          )}
        />
        {getError('street') && (
          <p className={errorClass}>{getError('street').message}</p>
        )}
      </div>

      {/* Landmark (Optional) */}
      {includeLandmark && (
        <div>
          <label htmlFor={`${name}.landmark`} className={labelClass}>
            Landmark {language === 'bn' && '(নিকটবর্তী স্থান)'}{' '}
            <span className="text-gray-400 text-xs">(Optional)</span>
          </label>
          <Controller
            name={`${name}.landmark`}
            control={control}
            rules={{
              maxLength: { value: 100, message: 'Landmark cannot exceed 100 characters' },
            }}
            render={({ field }) => (
              <input
                {...field}
                type="text"
                id={`${name}.landmark`}
                placeholder="e.g., Near Jamuna Future Park"
                className={inputClass(getError('landmark'))}
              />
            )}
          />
          {getError('landmark') && (
            <p className={errorClass}>{getError('landmark').message}</p>
          )}
        </div>
      )}

      {/* Postal Code */}
      <div>
        <label htmlFor={`${name}.postalCode`} className={labelClass}>
          Postal Code {language === 'bn' && '(পোস্ট কোড)'}
          {required && <span className="text-tomato-red ml-1">*</span>}
        </label>
        <Controller
          name={`${name}.postalCode`}
          control={control}
          rules={
            required
              ? {
                  required: 'Postal code is required',
                  pattern: { value: /^\d{4}$/, message: 'Postal code must be exactly 4 digits' },
                }
              : {}
          }
          render={({ field }) => (
            <input
              {...field}
              type="text"
              id={`${name}.postalCode`}
              placeholder="e.g., 1212"
              maxLength={4}
              className={inputClass(getError('postalCode'))}
            />
          )}
        />
        {getError('postalCode') && (
          <p className={errorClass}>{getError('postalCode').message}</p>
        )}
      </div>
    </div>
  );
};

export default BDAddressForm;
