
import React, { useState, useEffect } from "react";
import { Form, Input, Select, Row, Col } from "antd";
import { PhoneOutlined } from "@ant-design/icons";
import { phoneUtils, countryInfo } from "../utils/countryMobileLimits";

const { Option } = Select;

const PhoneInput = ({ form, name = "phone", label = "Phone", required = true, disabled = false }) => {
  const [selectedCountryCode, setSelectedCountryCode] = useState("91");
  const [phoneNumber, setPhoneNumber] = useState("");

  useEffect(() => {
    // Extract country code and phone number from existing value
    const currentPhone = form.getFieldValue(name);
    if (currentPhone) {
      const { countryCode, phoneNumber: number } = phoneUtils.parsePhoneNumber(currentPhone);
      if (countryCode) {
        setSelectedCountryCode(countryCode);
        form.setFieldsValue({ [`${name}CountryCode`]: countryCode });
      }
      if (number) {
        setPhoneNumber(number);
        form.setFieldsValue({ [name]: number });
      }
    }
  }, [form, name]);

  const validatePhoneNumber = (_, value) => {
    if (!value && required) {
      return Promise.reject(new Error(`Please enter ${label.toLowerCase()}`));
    }

    if (!value) return Promise.resolve();

    const cleanNumber = value.replace(/\D/g, "");
    const isValid = phoneUtils.validateMobileNumber(selectedCountryCode, cleanNumber);

    if (!isValid) {
      const limits = phoneUtils.getLimits(selectedCountryCode);
      return Promise.reject(
        new Error(
          `Phone number must be between ${limits.min} and ${
            limits.max
          } digits for ${countryInfo[selectedCountryCode]?.name || "selected country"}`
        )
      );
    }

    return Promise.resolve();
  };

  const handlePhoneNumberChange = (e) => {
    const value = e.target.value;
    const cleanValue = value.replace(/\D/g, "");

    const limits = phoneUtils.getLimits(selectedCountryCode);
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
          label: `${country?.flag || ""} ${country?.name || `Country ${code}`} (+${code})`,
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
          rules={required ? [{ required: true, message: "Select country" }] : []}
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
            }-${
              phoneUtils.getLimits(selectedCountryCode)?.max || 0
            } digits`}
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