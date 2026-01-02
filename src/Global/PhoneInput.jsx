import React, { useState, useEffect, useCallback } from "react";
import { Form, Input, Select, Row, Col } from "antd";
import { PhoneOutlined } from "@ant-design/icons";
import { phoneUtils, countryInfo, countryMobileLimits } from "../utils/countryMobileLimits";

const { Option } = Select;

const PhoneInput = ({
  form,
  name = "phone",
  label = "Phone",
  required = true,
  disabled = false,
}) => {
  const [selectedCountryCode, setSelectedCountryCode] = useState("91");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);

  // Helper function to extract country code (memoized with useCallback)
  // Uses countryMobileLimits directly from the utils file for reliable extraction
  const extractCountryCode = useCallback((phoneStr) => {
    if (!phoneStr || typeof phoneStr !== "string") return null;
    
    // Remove + prefix if present (handle multiple + signs or spaces)
    let phoneWithoutPlus = phoneStr.trim();
    // Remove all + signs from the beginning
    while (phoneWithoutPlus.startsWith("+")) {
      phoneWithoutPlus = phoneWithoutPlus.substring(1).trim();
    }
    
    // Clean the phone number - remove all non-digits
    const cleanPhone = phoneWithoutPlus.replace(/\D/g, "");
    
    if (!cleanPhone || cleanPhone.length < 7) return null; // Too short to be valid
    
    // Get all country codes directly from countryMobileLimits object
    // Convert to array and sort by length (longest first) to avoid partial matches
    // Example: "880" should match before "88" or "8" for Bangladesh
    const allCountryCodes = Object.keys(countryMobileLimits);
    const sortedCodes = allCountryCodes
      .map((code) => code.toString())
      .sort((a, b) => {
        // First sort by length (longest first) - CRITICAL for proper extraction
        if (b.length !== a.length) {
          return b.length - a.length;
        }
        // If same length, sort numerically for consistency
        return parseInt(a) - parseInt(b);
      });
    
    // Try each country code (longest first to avoid partial matches)
    for (const code of sortedCodes) {
      if (cleanPhone.startsWith(code)) {
        const phoneWithoutCode = cleanPhone.slice(code.length);
        
        // Get limits directly from countryMobileLimits
        const limits = countryMobileLimits[code];
        if (!limits) continue;
        
        // Skip if remaining number is too short (less than minimum required)
        if (phoneWithoutCode.length < limits.min) {
          continue; // Try next country code
        }
        
        // Validate the remaining phone number against country-specific limits
        const numberLength = phoneWithoutCode.replace(/\D/g, "").length;
        if (numberLength >= limits.min && numberLength <= limits.max) {
          return {
            countryCode: code,
            phoneNumber: phoneWithoutCode,
          };
        }
      }
    }
    
    // If no match found with strict validation, try with relaxed validation
    // This handles edge cases where numbers might be slightly outside limits
    for (const code of sortedCodes) {
      if (cleanPhone.startsWith(code)) {
        const phoneWithoutCode = cleanPhone.slice(code.length);
        const limits = countryMobileLimits[code];
        
        if (!limits) continue;
        
        // If we have limits and the number is within a reasonable range (allow 1 digit tolerance)
        const numberLength = phoneWithoutCode.replace(/\D/g, "").length;
        if (numberLength >= limits.min - 1 && numberLength <= limits.max + 1 && numberLength > 0) {
          return {
            countryCode: code,
            phoneNumber: phoneWithoutCode,
          };
        }
      }
    }
    
    return null;
  }, []);

  useEffect(() => {
    // Extract country code and phone number from existing value
    const currentPhone = form.getFieldValue(name);
    const currentCountryCodeField = form.getFieldValue(`${name}CountryCode`);
    
    if (currentPhone && typeof currentPhone === "string" && currentPhone.trim() !== "") {
      // Clean the phone number first - remove + prefix and all non-digits
      // Handle multiple + signs or spaces after +
      let phoneWithoutPlus = currentPhone.trim();
      while (phoneWithoutPlus.startsWith("+")) {
        phoneWithoutPlus = phoneWithoutPlus.substring(1).trim();
      }
      const cleanPhone = phoneWithoutPlus.replace(/\D/g, "");
      
      if (!cleanPhone || cleanPhone.length < 7) {
        // Phone number too short, just set default
        setSelectedCountryCode(currentCountryCodeField || selectedCountryCode);
        setPhoneNumber(cleanPhone || "");
        form.setFieldsValue({ 
          [`${name}CountryCode`]: currentCountryCodeField || selectedCountryCode,
          [name]: cleanPhone || "" 
        });
        setIsInitialized(true);
        return;
      }
      
      // Priority 1: Try extraction using country code list directly (most reliable)
      // This uses countryMobileLimits from the utils file for accurate extraction
      const extracted = extractCountryCode(currentPhone);
      
      if (extracted && extracted.countryCode && extracted.phoneNumber) {
        // Successfully extracted using country code list from countryMobileLimits
        setSelectedCountryCode(extracted.countryCode);
        setPhoneNumber(extracted.phoneNumber);
        form.setFieldsValue({ 
          [`${name}CountryCode`]: extracted.countryCode,
          [name]: extracted.phoneNumber 
        });
        setIsInitialized(true);
        return;
      }
      
      // Priority 2: If we have an existing country code field, use it
      if (currentCountryCodeField && phoneUtils.isCountryCodeSupported(currentCountryCodeField)) {
        const codeStr = currentCountryCodeField.toString();
        
        // Check if the clean phone starts with this country code
        if (cleanPhone.startsWith(codeStr)) {
          // Remove the country code prefix
          const phoneWithoutCode = cleanPhone.slice(codeStr.length);
          if (phoneWithoutCode.length > 0) {
            setSelectedCountryCode(codeStr);
            setPhoneNumber(phoneWithoutCode);
            form.setFieldsValue({ 
              [`${name}CountryCode`]: codeStr,
              [name]: phoneWithoutCode 
            });
            setIsInitialized(true);
            return;
          }
        } else {
          // Phone doesn't have country code prefix, use as-is with existing country code
          setSelectedCountryCode(codeStr);
          setPhoneNumber(cleanPhone);
          form.setFieldsValue({ 
            [`${name}CountryCode`]: codeStr,
            [name]: cleanPhone 
          });
          setIsInitialized(true);
          return;
        }
      }
      
      // Priority 3: Try default country code
      const codeToUse = selectedCountryCode.toString();
      if (cleanPhone.startsWith(codeToUse)) {
        const phoneWithoutCode = cleanPhone.slice(codeToUse.length);
        // Validate with default country code
        if (phoneUtils.validateMobileNumber(codeToUse, phoneWithoutCode)) {
          setSelectedCountryCode(codeToUse);
          setPhoneNumber(phoneWithoutCode);
          form.setFieldsValue({ 
            [`${name}CountryCode`]: codeToUse,
            [name]: phoneWithoutCode 
          });
          setIsInitialized(true);
          return;
        }
      }
      
      // Priority 4: Last attempt - try extraction one more time with relaxed validation
      const finalExtracted = extractCountryCode(currentPhone);
      if (finalExtracted && finalExtracted.countryCode && finalExtracted.phoneNumber) {
        setSelectedCountryCode(finalExtracted.countryCode);
        setPhoneNumber(finalExtracted.phoneNumber);
        form.setFieldsValue({ 
          [`${name}CountryCode`]: finalExtracted.countryCode,
          [name]: finalExtracted.phoneNumber 
        });
      } else {
        // Last resort: use default and entire number
        setSelectedCountryCode(codeToUse);
        setPhoneNumber(cleanPhone);
        form.setFieldsValue({ 
          [`${name}CountryCode`]: codeToUse,
          [name]: cleanPhone 
        });
      }
    } else if (currentCountryCodeField) {
      // If only country code exists, set it
      setSelectedCountryCode(currentCountryCodeField.toString());
    } else {
      // Set default country code if nothing exists
      form.setFieldsValue({ [`${name}CountryCode`]: selectedCountryCode });
    }
    
    setIsInitialized(true);
  }, [form, name, selectedCountryCode, extractCountryCode]);

  // Watch for form value changes to re-extract when values are set programmatically
  useEffect(() => {
    if (!isInitialized) return;
    
    const checkAndExtract = () => {
      const currentPhone = form.getFieldValue(name);
      const currentCountryCode = form.getFieldValue(`${name}CountryCode`);
      
      // Only re-extract if phone exists but country code doesn't match or is missing
      if (currentPhone && typeof currentPhone === "string" && currentPhone.trim() !== "") {
        // Remove + prefix properly (handle multiple + signs)
        let phoneWithoutPlus = currentPhone.trim();
        while (phoneWithoutPlus.startsWith("+")) {
          phoneWithoutPlus = phoneWithoutPlus.substring(1).trim();
        }
        const cleanPhone = phoneWithoutPlus.replace(/\D/g, "");
        
        if (!cleanPhone || cleanPhone.length < 7) {
          return; // Too short, skip
        }
        
        // Check if country code is already set and correctly matches
        if (currentCountryCode) {
          const codeStr = currentCountryCode.toString();
          if (cleanPhone.startsWith(codeStr)) {
            const phoneWithoutCode = cleanPhone.slice(codeStr.length);
            if (phoneUtils.validateMobileNumber(codeStr, phoneWithoutCode)) {
              // Already correctly set, no need to re-extract
              // But make sure state is in sync
              if (selectedCountryCode !== codeStr || phoneNumber !== phoneWithoutCode) {
                setSelectedCountryCode(codeStr);
                setPhoneNumber(phoneWithoutCode);
              }
              return;
            }
          }
        }
        
        // Re-extract using improved extraction function
        const extracted = extractCountryCode(currentPhone);
        if (extracted && extracted.countryCode && extracted.phoneNumber) {
          // Only update if different from current
          if (extracted.countryCode !== currentCountryCode || 
              extracted.phoneNumber !== phoneNumber) {
            setSelectedCountryCode(extracted.countryCode);
            setPhoneNumber(extracted.phoneNumber);
            form.setFieldsValue({ 
              [`${name}CountryCode`]: extracted.countryCode,
              [name]: extracted.phoneNumber 
            });
          }
        }
      }
    };
    
    // Check immediately and after delays to catch programmatic updates
    checkAndExtract();
    const timer1 = setTimeout(checkAndExtract, 100);
    const timer2 = setTimeout(checkAndExtract, 300);
    const timer3 = setTimeout(checkAndExtract, 500);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [form, name, isInitialized, extractCountryCode, selectedCountryCode, phoneNumber]);

  const validatePhoneNumber = (_, value) => {
    if (!value && required) {
      return Promise.reject(new Error(`Please enter ${label.toLowerCase()}`));
    }

    if (!value) return Promise.resolve();

    const cleanNumber = value.replace(/\D/g, "");
    const currentCountryCode =
      form.getFieldValue(`${name}CountryCode`) || selectedCountryCode;
    const isValid = phoneUtils.validateMobileNumber(
      currentCountryCode,
      cleanNumber
    );

    if (!isValid) {
      const limits = phoneUtils.getLimits(currentCountryCode);
      return Promise.reject(
        new Error(
          `Phone number must be between ${limits.min} and ${
            limits.max
          } digits for ${
            countryInfo[currentCountryCode]?.name || "selected country"
          }`
        )
      );
    }

    return Promise.resolve();
  };

  const handlePhoneNumberChange = (e) => {
    const value = e.target.value;
    const cleanValue = value.replace(/\D/g, "");

    const currentCountryCode =
      form.getFieldValue(`${name}CountryCode`) || selectedCountryCode;
    const limits = phoneUtils.getLimits(currentCountryCode);
    if (limits && cleanValue.length <= limits.max) {
      setPhoneNumber(cleanValue);
    }
  };

  const handleCountryCodeChange = (value) => {
    setSelectedCountryCode(value);
    form.setFieldsValue({ [`${name}CountryCode`]: value });
    form.validateFields([name]);
  };

  const getCountryOptions = () => {
    return phoneUtils
      .getSupportedCountryCodes()
      .map((code) => {
        const country = countryInfo[code];
        return {
          value: code,
          label: `${country?.flag || ""} ${
            country?.name || `Country ${code}`
          } (+${code})`,
          searchText: `${country?.name || ""} ${code}`.toLowerCase(),
        };
      })
      .sort((a, b) => a.label.localeCompare(b.label));
  };

  return (
    <Form.Item label={label} style={{ marginBottom: 0 }}>
      <Input.Group compact>
        <Form.Item
          name={`${name}CountryCode`}
          style={{ width: "30%" }}
          rules={
            required ? [{ required: true, message: "Select country" }] : []
          }
          initialValue={selectedCountryCode}
        >
          <Select
            showSearch
            placeholder="Country"
            onChange={handleCountryCodeChange}
            value={selectedCountryCode}
            filterOption={(input, option) =>
              option.searchText?.includes(input.toLowerCase())
            }
            style={{ width: "100%" }}
            disabled={disabled}
          >
            {getCountryOptions().map((option) => (
              <Option
                key={option.value}
                value={option.value}
                searchText={option.searchText}
              >
                {option.label}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name={name}
          style={{ width: "70%" }}
          rules={required ? [{ validator: validatePhoneNumber }] : []}
        >
          <Input
            prefix={<PhoneOutlined />}
            placeholder={`Enter ${
              phoneUtils.getLimits(selectedCountryCode)?.min || 0
            }-${phoneUtils.getLimits(selectedCountryCode)?.max || 0} digits`}
            value={phoneNumber}
            onChange={handlePhoneNumberChange}
            maxLength={phoneUtils.getLimits(selectedCountryCode)?.max || 15}
            disabled={disabled}
          />
        </Form.Item>
      </Input.Group>
    </Form.Item>
  );
};

export default PhoneInput;