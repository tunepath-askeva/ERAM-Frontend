import React, { useState, useEffect } from "react";
import { Form, Input, Select, Row, Col } from "antd";
import { PhoneOutlined } from "@ant-design/icons";
import { phoneUtils, countryInfo } from "../utils/countryMobileLimits";

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

  useEffect(() => {
    // Extract country code and phone number from existing value
    const currentPhone = form.getFieldValue(name);
    const currentCountryCodeField = form.getFieldValue(`${name}CountryCode`);
    
    if (currentPhone && typeof currentPhone === "string" && currentPhone.trim() !== "") {
      // Clean the phone number - remove all non-digits (including +, spaces, dashes, etc.)
      const cleanPhone = currentPhone.replace(/\D/g, "");
      
      if (cleanPhone) {
        // Try to parse the phone number to extract country code from the clean digits
        const { countryCode, phoneNumber: number } = phoneUtils.parsePhoneNumber(cleanPhone);
        
        if (countryCode && number && phoneUtils.validateMobileNumber(countryCode, number)) {
          // Country code was successfully detected, extracted, and validated
          setSelectedCountryCode(countryCode);
          setPhoneNumber(number);
          form.setFieldsValue({ 
            [`${name}CountryCode`]: countryCode,
            [name]: number 
          });
        } else if (currentCountryCodeField && phoneUtils.isCountryCodeSupported(currentCountryCodeField)) {
          // Use existing country code field if available and valid
          // Check if the clean phone starts with this country code
          if (cleanPhone.startsWith(currentCountryCodeField)) {
            // Remove the country code prefix
            const phoneWithoutCode = cleanPhone.slice(currentCountryCodeField.length);
            setSelectedCountryCode(currentCountryCodeField);
            setPhoneNumber(phoneWithoutCode);
            form.setFieldsValue({ [name]: phoneWithoutCode });
          } else {
            // Phone doesn't have country code prefix, use as-is
            setSelectedCountryCode(currentCountryCodeField);
            setPhoneNumber(cleanPhone);
            form.setFieldsValue({ [name]: cleanPhone });
          }
        } else {
          // No valid country code detected, use default and treat entire number as phone
          const codeToUse = selectedCountryCode;
          
          // Check if phone starts with the default country code
          if (cleanPhone.startsWith(codeToUse)) {
            const phoneWithoutCode = cleanPhone.slice(codeToUse.length);
            setSelectedCountryCode(codeToUse);
            setPhoneNumber(phoneWithoutCode);
            form.setFieldsValue({ 
              [`${name}CountryCode`]: codeToUse,
              [name]: phoneWithoutCode 
            });
          } else {
            // Use entire clean number as phone number
            setSelectedCountryCode(codeToUse);
            setPhoneNumber(cleanPhone);
            form.setFieldsValue({ 
              [`${name}CountryCode`]: codeToUse,
              [name]: cleanPhone 
            });
          }
        }
      }
    } else if (currentCountryCodeField) {
      // If only country code exists, set it
      setSelectedCountryCode(currentCountryCodeField);
    } else {
      // Set default country code if nothing exists
      form.setFieldsValue({ [`${name}CountryCode`]: selectedCountryCode });
    }
  }, [form, name]);

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