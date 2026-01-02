import React, { useState, useEffect, useCallback } from "react";
import { Form, Input, Select, Row, Col } from "antd";
import { PhoneOutlined } from "@ant-design/icons";
import { phoneUtils, countryInfo, countryMobileLimits } from "../../utils/countryMobileLimits";

const { Option } = Select;

const BranchPhoneInput = ({
  form,
  label = "Branch Phone",
  required = true,
  disabled = false,
}) => {
  const [selectedCountryCode, setSelectedCountryCode] = useState("91");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);

  // Field names for nested structure
  const phoneFieldName = ["location", "branch_phoneno"];
  const countryCodeFieldName = ["location", "branch_phonenoCountryCode"];

  // Helper function to extract country code
  const extractCountryCode = useCallback((phoneStr) => {
    if (!phoneStr || typeof phoneStr !== "string") return null;
    
    let phoneWithoutPlus = phoneStr.trim();
    while (phoneWithoutPlus.startsWith("+")) {
      phoneWithoutPlus = phoneWithoutPlus.substring(1).trim();
    }
    
    const cleanPhone = phoneWithoutPlus.replace(/\D/g, "");
    
    if (!cleanPhone || cleanPhone.length < 7) return null;
    
    const allCountryCodes = Object.keys(countryMobileLimits);
    const sortedCodes = allCountryCodes
      .map((code) => code.toString())
      .sort((a, b) => {
        if (b.length !== a.length) {
          return b.length - a.length;
        }
        return parseInt(a) - parseInt(b);
      });
    
    for (const code of sortedCodes) {
      if (cleanPhone.startsWith(code)) {
        const phoneWithoutCode = cleanPhone.slice(code.length);
        const limits = countryMobileLimits[code];
        if (!limits) continue;
        
        if (phoneWithoutCode.length < limits.min) {
          continue;
        }
        
        const numberLength = phoneWithoutCode.replace(/\D/g, "").length;
        if (numberLength >= limits.min && numberLength <= limits.max) {
          return {
            countryCode: code,
            phoneNumber: phoneWithoutCode,
          };
        }
      }
    }
    
    // Relaxed validation
    for (const code of sortedCodes) {
      if (cleanPhone.startsWith(code)) {
        const phoneWithoutCode = cleanPhone.slice(code.length);
        const limits = countryMobileLimits[code];
        if (!limits) continue;
        
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
    // Only run on initial mount/initialization, not during typing
    if (isInitialized) return;
    
    // Priority 1: Use stored country code from form field
    const currentCountryCodeField = form.getFieldValue(countryCodeFieldName);
    const currentPhone = form.getFieldValue(phoneFieldName);
    
    // If we have a stored country code, use it directly
    if (currentCountryCodeField && phoneUtils.isCountryCodeSupported(currentCountryCodeField)) {
      const codeStr = currentCountryCodeField.toString();
      setSelectedCountryCode(codeStr);
      
      // If we also have a phone number, check if it needs processing
      if (currentPhone && typeof currentPhone === "string" && currentPhone.trim() !== "") {
        let phoneWithoutPlus = currentPhone.trim();
        while (phoneWithoutPlus.startsWith("+")) {
          phoneWithoutPlus = phoneWithoutPlus.substring(1).trim();
        }
        const cleanPhone = phoneWithoutPlus.replace(/\D/g, "");
        
        // If phone starts with country code, remove it
        if (cleanPhone.startsWith(codeStr)) {
          const phoneWithoutCode = cleanPhone.slice(codeStr.length);
          if (phoneWithoutCode.length > 0) {
            setPhoneNumber(phoneWithoutCode);
            form.setFieldsValue({ 
              [countryCodeFieldName]: codeStr,
              [phoneFieldName]: phoneWithoutCode 
            });
            setIsInitialized(true);
            return;
          }
        } else {
          // Phone doesn't have country code prefix, use as-is
          setPhoneNumber(cleanPhone);
          form.setFieldsValue({ 
            [countryCodeFieldName]: codeStr,
            [phoneFieldName]: cleanPhone 
          });
          setIsInitialized(true);
          return;
        }
      } else {
        // Only country code, no phone number yet
        form.setFieldsValue({ [countryCodeFieldName]: codeStr });
        setIsInitialized(true);
        return;
      }
    }
    
    // Priority 2: If we have phone but no stored country code, try extraction (only on init)
    if (currentPhone && typeof currentPhone === "string" && currentPhone.trim() !== "") {
      let phoneWithoutPlus = currentPhone.trim();
      while (phoneWithoutPlus.startsWith("+")) {
        phoneWithoutPlus = phoneWithoutPlus.substring(1).trim();
      }
      const cleanPhone = phoneWithoutPlus.replace(/\D/g, "");
      
      if (!cleanPhone || cleanPhone.length < 7) {
        setSelectedCountryCode(selectedCountryCode);
        setPhoneNumber(cleanPhone || "");
        form.setFieldsValue({ 
          [countryCodeFieldName]: selectedCountryCode,
          [phoneFieldName]: cleanPhone || "" 
        });
        setIsInitialized(true);
        return;
      }
      
      // Try extraction using country code list (only on initialization)
      const extracted = extractCountryCode(currentPhone);
      
      if (extracted && extracted.countryCode && extracted.phoneNumber) {
        setSelectedCountryCode(extracted.countryCode);
        setPhoneNumber(extracted.phoneNumber);
        form.setFieldsValue({ 
          [countryCodeFieldName]: extracted.countryCode,
          [phoneFieldName]: extracted.phoneNumber 
        });
        setIsInitialized(true);
        return;
      }
      
      // Last resort: use default and entire number
      const codeToUse = selectedCountryCode.toString();
      setSelectedCountryCode(codeToUse);
      setPhoneNumber(cleanPhone);
      form.setFieldsValue({ 
        [countryCodeFieldName]: codeToUse,
        [phoneFieldName]: cleanPhone 
      });
    } else {
      // Set default country code if nothing exists
      form.setFieldsValue({ [countryCodeFieldName]: selectedCountryCode });
    }
    
    setIsInitialized(true);
  }, [form, selectedCountryCode, extractCountryCode, phoneFieldName, countryCodeFieldName, isInitialized]);

  const validatePhoneNumber = (_, value) => {
    if (!value && required) {
      return Promise.reject(new Error(`Please enter ${label.toLowerCase()}`));
    }

    if (!value) return Promise.resolve();

    const cleanNumber = value.replace(/\D/g, "");
    const currentCountryCode =
      form.getFieldValue(countryCodeFieldName) || selectedCountryCode;
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
      form.getFieldValue(countryCodeFieldName) || selectedCountryCode;
    const limits = phoneUtils.getLimits(currentCountryCode);
    if (limits && cleanValue.length <= limits.max) {
      setPhoneNumber(cleanValue);
      // Update form value directly - don't trigger re-extraction
      form.setFieldsValue({ [phoneFieldName]: cleanValue });
    }
  };

  const handleCountryCodeChange = (value) => {
    setSelectedCountryCode(value);
    form.setFieldsValue({ [countryCodeFieldName]: value });
    form.validateFields([phoneFieldName]);
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
          name={countryCodeFieldName}
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
          name={phoneFieldName}
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

export default BranchPhoneInput;

