import React from 'react';
import { Form, Input, Select, DatePicker, InputNumber, Row, Col, Divider } from 'antd';
import { EnvironmentOutlined, UserOutlined } from '@ant-design/icons';

const { Option } = Select;
const { TextArea } = Input;

const JobDetailsForm = ({
  form,
  pipelines,
  recruiters,
  projects,
  isPipelinesLoading,
  isRecruitersLoading,
  isProjectsLoading,
  selectedProject,
  jobCodePrefix,
  handleProjectChange,
  handleJobCodeChange
}) => {
  return (
    <div>
      {/* Job Title Section */}
      <Divider orientation="left">Job Title and Department</Divider>
      <Row gutter={16}>
        <Col span={24}>
          <Form.Item
            name="title"
            label="Job Title"
            rules={[{ required: true, message: 'Please enter job title' }]}
          >
            <Input placeholder="e.g. Senior Software Engineer" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="project"
            label="Select Project"
            rules={[{ required: true, message: 'Please select project' }]}
          >
            <Select
              loading={isProjectsLoading}
              onChange={handleProjectChange}
              placeholder="Select project"
            >
              {projects?.allProjects?.map(project => (
                <Option key={project._id} value={project._id}>
                  {project.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="jobCode"
            label="Job Code"
            rules={[{ required: true, message: 'Please enter job code' }]}
          >
            <Input 
              placeholder="e.g. DEV-001" 
              onChange={handleJobCodeChange}
              addonBefore={jobCodePrefix ? `${jobCodePrefix}-` : null}
            />
          </Form.Item>
        </Col>
      </Row>

      {/* Assign Status Section */}
      <Divider orientation="left">Assign Status</Divider>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="recruiter"
            label="Assign Recruiter"
            rules={[{ required: true, message: 'Please assign recruiter' }]}
          >
            <Select loading={isRecruitersLoading} placeholder="Select recruiter">
              {recruiters?.recruiters?.map(recruiter => (
                <Option key={recruiter._id} value={recruiter._id}>
                  {recruiter.fullName}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="pipeline"
            label="Assign Pipeline"
            rules={[{ required: true, message: 'Please assign pipeline' }]}
          >
            <Select loading={isPipelinesLoading} placeholder="Select pipeline">
              {pipelines?.allPipelines?.map(pipeline => (
                <Option key={pipeline._id} value={pipeline._id}>
                  {pipeline.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            name="startDate"
            label="Start Date"
            rules={[{ required: true, message: 'Please select start date' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="endDate"
            label="End Date"
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="deadlineDate"
            label="Deadline"
            rules={[{ required: true, message: 'Please select deadline' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Col>
      </Row>

      {/* Location Section */}
      <Divider orientation="left">Location</Divider>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="workplace"
            label="Workplace"
            rules={[{ required: true, message: 'Please select workplace' }]}
          >
            <Select placeholder="Select workplace type">
              <Option value="remote">Remote</Option>
              <Option value="hybrid">Hybrid</Option>
              <Option value="on-site">On-site</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="officeLocation"
            label="Office Location"
            rules={[{ required: true, message: 'Please enter office location' }]}
          >
            <Input 
              placeholder="e.g. San Francisco, CA" 
              prefix={<EnvironmentOutlined />}
            />
          </Form.Item>
        </Col>
      </Row>

      {/* Description Section */}
      <Divider orientation="left">Description</Divider>
      <Form.Item
        name="description"
        label="About the Role"
        rules={[{ required: true, message: 'Please enter job description' }]}
      >
        <TextArea rows={4} placeholder="Describe the role and responsibilities..." />
      </Form.Item>

      <Form.Item
        name="jobRequirements"
        label="Requirements"
        rules={[{ required: true, message: 'Please enter job requirements' }]}
      >
        <TextArea rows={4} placeholder="Enter requirements (one per line)" />
      </Form.Item>

      <Form.Item
        name="benefits"
        label="Benefits"
      >
        <TextArea rows={4} placeholder="Enter benefits (one per line)" />
      </Form.Item>

      {/* Company Industry and Job Function */}
      <Divider orientation="left">Company Industry and Job Function</Divider>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="companyIndustry"
            label="Company Industry"
            rules={[{ required: true, message: 'Please select industry' }]}
          >
            <Select placeholder="Select industry">
              <Option value="Technology">Technology</Option>
              <Option value="Finance">Finance</Option>
              <Option value="Healthcare">Healthcare</Option>
              <Option value="Education">Education</Option>
              <Option value="Retail">Retail</Option>
              <Option value="Manufacturing">Manufacturing</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="jobFunction"
            label="Job Function"
            rules={[{ required: true, message: 'Please select job function' }]}
          >
            <Select placeholder="Select job function">
              <Option value="Software Development">Software Development</Option>
              <Option value="Product Management">Product Management</Option>
              <Option value="Design">Design</Option>
              <Option value="Marketing">Marketing</Option>
              <Option value="Sales">Sales</Option>
              <Option value="Operations">Operations</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      {/* Employment Details */}
      <Divider orientation="left">Employment Details</Divider>
      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            name="EmploymentType"
            label="Employment Type"
            rules={[{ required: true, message: 'Please select employment type' }]}
          >
            <Select placeholder="Select type">
              <Option value="full-time">Full-time</Option>
              <Option value="part-time">Part-time</Option>
              <Option value="contract">Contract</Option>
              <Option value="temporary">Temporary</Option>
              <Option value="internship">Internship</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="Experience"
            label="Experience"
            rules={[{ required: true, message: 'Please select experience level' }]}
          >
            <Select placeholder="Select experience">
              <Option value="0-1 years">0-1 years</Option>
              <Option value="1-3 years">1-3 years</Option>
              <Option value="3-5 years">3-5 years</Option>
              <Option value="5+ years">5+ years</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="Education"
            label="Education"
          >
            <Select placeholder="Select education">
              <Option value="High School">High School</Option>
              <Option value="Bachelor's Degree">Bachelor's Degree</Option>
              <Option value="Master's Degree">Master's Degree</Option>
              <Option value="PhD">PhD</Option>
              <Option value="No Formal Education Required">No Formal Education Required</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        name="keywords"
        label="Keywords (for search)"
        tooltip="Separate keywords with commas"
      >
        <Select
          mode="tags"
          style={{ width: '100%' }}
          placeholder="Enter keywords"
          tokenSeparators={[',']}
        />
      </Form.Item>

       <Form.Item
        name="requiredSkills"
        label="Required Skills"
        tooltip="Separate skills with commas"
      >
        <Select
          mode="tags"
          style={{ width: '100%' }}
          placeholder="Enter skills"
          tokenSeparators={[',']}
        />
      </Form.Item>

      {/* Annual Salary */}
      <Divider orientation="left">Annual Salary</Divider>
      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            name={['salary', 'from']}
            label="From"
          >
            <InputNumber 
              style={{ width: '100%' }} 
              placeholder="Minimum" 
              min={0}
            />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name={['salary', 'to']}
            label="To"
          >
            <InputNumber 
              style={{ width: '100%' }} 
              placeholder="Maximum" 
              min={0}
            />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name={['salary', 'currency']}
            label="Currency"
            initialValue="USD"
          >
            <Select>
              <Option value="USD">USD ($)</Option>
              <Option value="EUR">EUR (€)</Option>
              <Option value="GBP">GBP (£)</Option>
              <Option value="INR">INR (₹)</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>
      <Form.Item
        name={['salary', 'type']}
        label="Salary Type"
        initialValue="yearly"
      >
        <Select>
          <Option value="daily">Daily</Option>
          <Option value="weekly">Weekly</Option>
          <Option value="monthly">Monthly</Option>
          <Option value="yearly">Yearly</Option>
        </Select>
      </Form.Item>
    </div>
  );
};

export default JobDetailsForm;