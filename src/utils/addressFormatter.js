/**
 * Address Formatter Utilities for Bangladesh Hierarchical Address System
 * Formats address data from the backend for display in the frontend
 */

/**
 * Format hierarchical BD address for display
 * @param {Object} address - Address object with populated references
 * @param {String} language - 'en' or 'bn' for English or Bengali
 * @returns {String} Formatted address string
 */
export const formatBDAddress = (address, language = 'en') => {
  if (!address) return 'Not provided';

  const parts = [];

  // Street address
  if (address.street) {
    parts.push(address.street);
  }

  // Landmark (optional)
  if (address.landmark) {
    parts.push(`(${address.landmark})`);
  }

  // Union/Ward (optional)
  if (address.union) {
    const unionName = language === 'bn'
      ? address.union.name?.bn || address.union.nameBn
      : address.union.name?.en || address.union.nameEn || address.union.name;
    if (unionName) parts.push(unionName);
  }

  // Upazila (required)
  if (address.upazila) {
    const upazilaName = language === 'bn'
      ? address.upazila.name?.bn || address.upazila.nameBn
      : address.upazila.name?.en || address.upazila.nameEn || address.upazila.name;
    if (upazilaName) parts.push(upazilaName);
  }

  // District (required)
  if (address.district) {
    const districtName = language === 'bn'
      ? address.district.name?.bn || address.district.nameBn
      : address.district.name?.en || address.district.nameEn || address.district.name;
    if (districtName) parts.push(districtName);
  }

  // Division (required)
  if (address.division) {
    const divisionName = language === 'bn'
      ? address.division.name?.bn || address.division.nameBn
      : address.division.name?.en || address.division.nameEn || address.division.name;
    if (divisionName) parts.push(divisionName);
  }

  // Postal code
  if (address.postalCode) {
    parts.push(address.postalCode);
  }

  return parts.join(', ');
};

/**
 * Format short address (street + upazila + district)
 * Useful for listing cards and compact displays
 * @param {Object} address - Address object with populated references
 * @param {String} language - 'en' or 'bn' for English or Bengali
 * @returns {String} Short formatted address string
 */
export const formatShortAddress = (address, language = 'en') => {
  if (!address) return 'Not provided';

  const parts = [];

  // Street address
  if (address.street) {
    parts.push(address.street);
  }

  // Upazila
  if (address.upazila) {
    const name = language === 'bn'
      ? address.upazila.name?.bn || address.upazila.nameBn
      : address.upazila.name?.en || address.upazila.nameEn || address.upazila.name;
    if (name) parts.push(name);
  }

  // District
  if (address.district) {
    const name = language === 'bn'
      ? address.district.name?.bn || address.district.nameBn
      : address.district.name?.en || address.district.nameEn || address.district.name;
    if (name) parts.push(name);
  }

  return parts.join(', ') || 'Not provided';
};

/**
 * Format location name (for dropdowns and selections)
 * @param {Object} location - Location object (division/district/upazila/union)
 * @param {String} language - 'en' or 'bn' for English or Bengali
 * @returns {String} Formatted location name
 */
export const formatLocationName = (location, language = 'en') => {
  if (!location) return '';

  if (language === 'bn') {
    return location.name?.bn || location.nameBn || location.name?.en || location.nameEn || location.name || '';
  }

  return location.name?.en || location.nameEn || location.name || '';
};

/**
 * Extract address ObjectIds for form submission
 * Converts full address object with populated refs to just ObjectIds
 * @param {Object} address - Address object (may have populated refs or just IDs)
 * @returns {Object} Address object with only ObjectIds
 */
export const extractAddressIds = (address) => {
  if (!address) return null;

  return {
    division: typeof address.division === 'object' ? address.division._id || address.division.id : address.division,
    district: typeof address.district === 'object' ? address.district._id || address.district.id : address.district,
    upazila: typeof address.upazila === 'object' ? address.upazila._id || address.upazila.id : address.upazila,
    union: typeof address.union === 'object' ? address.union._id || address.union.id : address.union,
    street: address.street || '',
    landmark: address.landmark || '',
    postalCode: address.postalCode || '',
    coordinates: address.coordinates || [],
  };
};

/**
 * Validate if address has all required fields
 * @param {Object} address - Address object to validate
 * @returns {Boolean} True if address has all required fields
 */
export const isValidAddress = (address) => {
  if (!address) return false;

  return !!(
    address.division &&
    address.district &&
    address.upazila &&
    address.street &&
    address.postalCode
  );
};
