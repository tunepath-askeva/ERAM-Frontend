import React, { useState } from "react";
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Select, 
  Typography, 
  Space,
  Divider,
  Alert,
  message
} from "antd";
import { 
  EyeInvisibleOutlined, 
  EyeTwoTone, 
  ArrowLeftOutlined,
  UserAddOutlined
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUserCredentials } from "../Slices/Users/UserSlice";
import { useRegisterUserMutation } from "../Slices/Users/UserApis";

const { Title, Text } = Typography;
const { Option } = Select;

const Register = () => {
  const [form] = Form.useForm();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const [registerUser, { isLoading }] = useRegisterUserMutation();

  const roles = [
    { value: "recruiter", label: "Recruiter" },
    { value: "client", label: "Client" },
    { value: "candidate", label: "Candidate" },
    { value: "employee", label: "Employee" },
  ];

  const onFinish = async (values) => {
    setLoading(true);
    const fullName = `${values.firstName} ${values.lastName}`;

    const userData = {
      firstName: values.firstName,
      lastName: values.lastName,
      fullName: fullName,
      role: values.role,
      email: values.email,
      phone: values.phone,
      cPassword: values.cPassword,
    };

    try {
      console.log("Registration data:", userData);
      
      // Uncomment when ready to use the API
      const response = await registerUser(userData).unwrap();
      console.log("Registration successful:", response);

      // Dispatch user credentials to Redux store
      const userInfo = {
        fullName: fullName,
        role: values.role,
        email: values.email,
        phone: values.phone,
      };

      dispatch(setUserCredentials(userInfo));
      message.success("Registration successful!");
    } catch (error) {
      console.error("Registration failed:", error);
      message.error("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Illustration/Info */}
        <div className="hidden lg:flex flex-col items-center justify-center space-y-6 p-8">
          <div className="w-32 h-32 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
            <UserAddOutlined className="text-white text-4xl" />
          </div>
          <div className="text-center space-y-4">
            <Title level={2} className="text-slate-800">
              Join Our Platform
            </Title>
            <Text className="text-slate-600 max-w-md">
              Create your account and start connecting with opportunities that
              match your goals.
            </Text>
          </div>
        </div>

        {/* Right Side - Registration Form */}
        <Card className="w-full max-w-md mx-auto shadow-xl border-0">
          <div className="p-6">
            <Space className="flex items-center justify-between mb-6">
              <Link to="/login" className="flex items-center text-slate-600 hover:text-slate-800">
                <ArrowLeftOutlined className="mr-1" />
                Back to Login
              </Link>
              <div className="flex items-center lg:hidden">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                  <UserAddOutlined className="text-white text-xl" />
                </div>
              </div>
            </Space>

            <div className="text-center mb-8">
              <Title level={3} className="text-slate-800">
                Create Account
              </Title>
              <Text type="secondary">Fill in your details to get started</Text>
            </div>

            <Form
              form={form}
              name="register"
              onFinish={onFinish}
              layout="vertical"
              scrollToFirstError
            >
              <Space size={16} direction="vertical" className="w-full">
                {/* First Name and Last Name */}
                <Space size={16} className="w-full">
                  <Form.Item
                    name="firstName"
                    label="First Name"
                    rules={[
                      { required: true, message: 'Please input your first name!' }
                    ]}
                    className="w-full"
                  >
                    <Input placeholder="John" />
                  </Form.Item>
                  <Form.Item
                    name="lastName"
                    label="Last Name"
                    rules={[
                      { required: true, message: 'Please input your last name!' }
                    ]}
                    className="w-full"
                  >
                    <Input placeholder="Doe" />
                  </Form.Item>
                </Space>

                {/* Role Selection */}
                <Form.Item
                  name="role"
                  label="Register As"
                  rules={[
                    { required: true, message: 'Please select your role!' }
                  ]}
                >
                  <Select placeholder="Select your role">
                    {roles.map((role) => (
                      <Option key={role.value} value={role.value}>
                        {role.label}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                {/* Email */}
                <Form.Item
                  name="email"
                  label="Email Address"
                  rules={[
                    { required: true, message: 'Please input your email!' },
                    { type: 'email', message: 'Please enter a valid email!' }
                  ]}
                >
                  <Input placeholder="john.doe@example.com" />
                </Form.Item>

                {/* Phone */}
                <Form.Item
                  name="phone"
                  label="Phone Number"
                  rules={[
                    { required: true, message: 'Please input your phone number!' }
                  ]}
                >
                  <Input placeholder="+1 (555) 123-4567" />
                </Form.Item>

                {/* Password */}
                <Form.Item
                  name="password"
                  label="Password"
                  rules={[
                    { required: true, message: 'Please input your password!' },
                    { min: 6, message: 'Password must be at least 6 characters!' }
                  ]}
                  hasFeedback
                >
                  <Input.Password
                    placeholder="Create a strong password"
                    iconRender={(visible) => (
                      visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                    )}
                  />
                </Form.Item>

                {/* Confirm Password */}
                <Form.Item
                  name="cPassword"
                  label="Confirm Password"
                  dependencies={['password']}
                  hasFeedback
                  rules={[
                    { required: true, message: 'Please confirm your password!' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('password') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('The two passwords do not match!'));
                      },
                    }),
                  ]}
                >
                  <Input.Password
                    placeholder="Confirm your password"
                    iconRender={(visible) => (
                      visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                    )}
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0"
                    loading={loading}
                  >
                    Create Account
                  </Button>
                </Form.Item>

                <Divider>
                  <Text type="secondary">OR</Text>
                </Divider>

                <div className="text-center">
                  <Text type="secondary">
                    Already have an account?{" "}
                    <Link
                      to="/login"
                      className="text-blue-600 hover:text-blue-700 hover:underline font-medium"
                    >
                      Sign In
                    </Link>
                  </Text>
                </div>
              </Space>
            </Form>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Register;