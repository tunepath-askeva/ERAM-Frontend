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
    if (currentPhone && typeof currentPhone === "string") {
      // Handle phone numbers that start with '+' (international format)
      if (currentPhone.startsWith("")) {
        const { countryCode, phoneNumber: number } =
          phoneUtils.parsePhoneNumber(currentPhone);
        if (countryCode) {
          setSelectedCountryCode(countryCode);
          form.setFieldsValue({ [`${name}CountryCode`]: countryCode });
        }
        if (number) {
          setPhoneNumber(number);
          form.setFieldsValue({ [name]: number });
        }
      } else {
        // Handle phone numbers without '+' - assume they might already be separated
        // or use default country code (91 for India)
        setPhoneNumber(currentPhone);
        form.setFieldsValue({ [name]: currentPhone });
        // Set default country code if not already set
        if (!form.getFieldValue(`${name}CountryCode`)) {
          form.setFieldsValue({ [`${name}CountryCode`]: selectedCountryCode });
        }
      }
    }
  }, [form, name, selectedCountryCode]);

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
          } (${code})`,
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
        >
          <Select
            showSearch
            placeholder="Country"
            onChange={handleCountryCodeChange}
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
