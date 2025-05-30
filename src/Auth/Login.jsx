import React from 'react';
import { Form, Input, Button, Card, message, Divider, Space } from 'antd';
import { UserOutlined, LockOutlined, GoogleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useLoginUserMutation } from '../Slices/Users/UserApis';
import { setUserCredentials } from '../Slices/Users/UserSlice';

const Login = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loginUser, { isLoading }] = useLoginUserMutation();

  const onFinish = async (values) => {
    try {
      const response = await loginUser({
        email: values.email,
        password: values.password,
      }).unwrap();

      message.success('Login successful!');
      
      localStorage.setItem('token', response.token);
      
      const userInfo = {
        email: response.user.email,
        token: response.token,
        name: response.user.name,
        roles: response.user.roles
      };
      
      dispatch(setUserCredentials(userInfo));
      
      navigate('/dashboard');
      
    } catch (error) {
      console.error('Login error:', error);
      message.error(error?.data?.message || 'Login failed. Please try again.');
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
    message.error('Please check your input fields');
  };

  const handleGoogleSignIn = () => {
    message.info('Google Sign-In functionality to be implemented');
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <Card 
        style={{ 
          width: '100%',
          maxWidth: 450, 
          boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
          borderRadius: '20px',
          border: 'none',
          overflow: 'hidden'
        }}
        bodyStyle={{ padding: '40px' }}
      >
        {/* Company Logo Section */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '40px' 
        }}>
          <div style={{
            margin: '0 auto 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px',
            color: 'white',
            fontWeight: 'bold'
          }}>
            <img 
              src="/Eram-Logo.png" 
              alt="Company Logo" 
              style={{ 
                width: '100%', 
                height: '100%', 
              }}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            <span style={{ display: 'none' }}>Logo</span>
          </div>
          <h1 style={{ 
            margin: 0, 
            fontSize: '28px', 
            fontWeight: '700',
            color: '#2c3e50',
            marginBottom: '8px'
          }}>
            Welcome Back
          </h1>
          <p style={{ 
            margin: 0, 
            color: '#7f8c8d',
            fontSize: '16px'
          }}>
            Sign in to your account
          </p>
        </div>

        <Button
          onClick={handleGoogleSignIn}
          size="large"
          block
          style={{
            marginBottom: '20px',
            height: '48px',
            borderRadius: '12px',
            border: '1px solid #e1e5e9',
            backgroundColor: '#fff',
            color: '#5f6368',
            fontSize: '16px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px'
          }}
          icon={<GoogleOutlined style={{ fontSize: '20px', color: '#4285f4' }} />}
        >
          Continue with Google
        </Button>

        <Divider style={{ 
          margin: '24px 0',
          color: '#bdc3c7',
          fontSize: '14px'
        }}>
          or sign in with email
        </Divider>

        {/* Login Form */}
        <Form
          form={form}
          name="login"
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
          layout="vertical"
        >
          <Form.Item
            label={<span style={{ fontSize: '14px', fontWeight: '600', color: '#2c3e50' }}>Email Address</span>}
            name="email"
            rules={[
              {
                required: true,
                message: 'Please input your email!',
              },
              {
                type: 'email',
                message: 'Please enter a valid email address!',
              },
            ]}
          >
            <Input 
              prefix={<UserOutlined style={{ color: '#bdc3c7' }} />} 
              placeholder="Enter your email address"
              size="large"
              style={{
                borderRadius: '12px',
                border: '1px solid #e1e5e9',
                height: '48px',
                fontSize: '16px'
              }}
            />
          </Form.Item>

          <Form.Item
            label={<span style={{ fontSize: '14px', fontWeight: '600', color: '#2c3e50' }}>Password</span>}
            name="password"
            rules={[
              {
                required: true,
                message: 'Please input your password!',
              },
              {
                min: 6,
                message: 'Password must be at least 6 characters!',
              },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#bdc3c7' }} />}
              placeholder="Enter your password"
              size="large"
              style={{
                borderRadius: '12px',
                border: '1px solid #e1e5e9',
                height: '48px',
                fontSize: '16px'
              }}
            />
          </Form.Item>

          {/* Forgot Password Link */}
          <div style={{ 
            textAlign: 'right', 
            marginBottom: '24px' 
          }}>
            <Button 
              type="link" 
              onClick={handleForgotPassword}
              style={{ 
                padding: 0,
                fontSize: '14px',
                color: '#667eea',
                fontWeight: '500'
              }}
            >
              Forgot password?
            </Button>
          </div>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={isLoading}
              block
              size="large"
              style={{ 
                height: '48px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                fontSize: '16px',
                fontWeight: '600',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
              }}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </Form.Item>
        </Form>

        {/* Sign Up Link */}
        <div style={{ 
          textAlign: 'center', 
          marginTop: '32px',
          paddingTop: '24px',
          borderTop: '1px solid #ecf0f1'
        }}>
          <span style={{ color: '#7f8c8d', fontSize: '14px' }}>
            Don't have an account?{' '}
            <Button 
              type="link" 
              onClick={() => navigate('/register')}
              style={{ 
                padding: 0,
                fontSize: '14px',
                color: '#667eea',
                fontWeight: '600'
              }}
            >
              Sign up here
            </Button>
          </span>
        </div>
      </Card>
    </div>
  );
};

export default Login;