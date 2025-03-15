"use client";

import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Send, HelpCircle, Loader2 } from 'lucide-react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import Select from 'react-select';
import toast, { Toaster } from 'react-hot-toast';
import { counties, industries, departments, roles, challenges } from './formData';

interface FormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  country: string;
  county: string;
  industry: string;
  department: string;
  role: string;
  challenges: string[];
  honeypot: string;
}

function Contact() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    company: '',
    country: '',
    county: '',
    industry: '',
    department: '',
    role: '',
    challenges: [],
    honeypot: '', // Honeypot field for spam prevention
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const validateForm = () => {
    const newErrors: Partial<FormData> = {};

    if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters long';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    }
    if (!formData.company) {
      newErrors.company = 'Company name is required';
    }
    if (!formData.country) {
      newErrors.country = 'Country is required';
    }
    if (formData.country === 'Kenya' && !formData.county) {
      newErrors.county = 'County is required for Kenya';
    }
    if (!formData.industry) {
      newErrors.industry = 'Industry is required';
    }
    if (!formData.department) {
      newErrors.department = 'Department is required';
    }
    if (!formData.role) {
      newErrors.role = 'Role is required';
    }
    if (formData.challenges.length === 0) {
      newErrors.challenges = ['Please select at least one challenge'];
    }
    if (formData.challenges.length > 3) {
      newErrors.challenges = ['Please select no more than 3 challenges'];
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.honeypot) {
      // If honeypot field is filled, silently reject the submission
      return;
    }

    if (!validateForm()) {
      toast.error('Please check the form for errors');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_key: 'b4aa257b-307a-4313-88b8-414e2203aedf',
          ...formData,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSubmitted(true);
        toast.success('Form submitted successfully!');
      } else {
        throw new Error('Submission failed');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      country: '',
      county: '',
      industry: '',
      department: '',
      role: '',
      challenges: [],
      honeypot: '',
    });
    setSubmitted(false);
    setErrors({});
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#020220] text-gray-900 dark:text-white flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-[#FF4500] rounded-full flex items-center justify-center mx-auto mb-6">
              <Send className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Thank You for Joining!</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              Your application has been received. We'll be in touch soon to schedule your demo and discuss how Yapa Hub can transform your business.
            </p>
            <div className="space-x-4">
              <button
                onClick={handleReset}
                className="px-6 py-3 bg-[#FF4500] text-white rounded-lg font-semibold hover:bg-[#E63F00] transition"
              >
                Submit Another Response
              </button>
              <Link
                to="/"
                className="inline-flex items-center text-[#FF4500] hover:text-[#E63F00] transition"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#020220] text-gray-900 dark:text-white">
      <Toaster position="top-right" />
      <div className="container mx-auto px-6 py-12">
        <Link
          to="/"
          className="inline-flex items-center text-gray-300 hover:text-white mb-8 transition"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Home
        </Link>

        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">Join the Waitlist</h1>
          <p className="text-gray-300 mb-8">
            Complete the form below to join our waiting list and be among the first to experience Yapa Hub's AI-powered customer experience platform.
          </p>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Honeypot field */}
            <input
              type="text"
              name="honeypot"
              style={{ display: 'none' }}
              value={formData.honeypot}
              onChange={(e) => setFormData({ ...formData, honeypot: e.target.value })}
            />

            {/* Personal Information */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    minLength={2}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-[#FF4500] focus:ring-1 focus:ring-[#FF4500] transition text-gray-900 dark:text-white"
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? 'name-error' : undefined}
                  />
                  {errors.name && (
                    <p id="name-error" className="mt-1 text-sm text-red-500">
                      {errors.name}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-[#FF4500] focus:ring-1 focus:ring-[#FF4500] transition text-gray-900 dark:text-white"
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                  />
                  {errors.email && (
                    <p id="email-error" className="mt-1 text-sm text-red-500">
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium mb-2">
                    Phone Number *
                  </label>
                  <PhoneInput
                    country={'ke'}
                    value={formData.phone}
                    onChange={(phone) => setFormData({ ...formData, phone })}
                    inputProps={{
                      required: true,
                      className: 'w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-[#FF4500] focus:ring-1 focus:ring-[#FF4500] transition text-white',
                    }}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="company" className="block text-sm font-medium mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    id="company"
                    required
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-[#FF4500] focus:ring-1 focus:ring-[#FF4500] transition text-gray-900 dark:text-white"
                  />
                  {errors.company && (
                    <p className="mt-1 text-sm text-red-500">{errors.company}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Company Details */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Company Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="country" className="block text-sm font-medium mb-2">
                    Country *
                  </label>
                  <Select
                    id="country"
                    value={{ value: formData.country, label: formData.country }}
                    onChange={(option) => setFormData({ ...formData, country: option?.value || '' })}
                    options={[
                      { value: 'Kenya', label: 'Kenya' },
                      { value: 'Tanzania', label: 'Tanzania' },
                      { value: 'Uganda', label: 'Uganda' },
                      { value: 'Nigeria', label: 'Nigeria' },
                      { value: 'South Africa', label: 'South Africa' },
                      { value: 'Algeria', label: 'Algeria' },
                      { value: 'Angola', label: 'Angola' },
                      { value: 'Benin', label: 'Benin' },
                      { value: 'Botswana', label: 'Botswana' },
                      { value: 'Burkina Faso', label: 'Burkina Faso' },
                      { value: 'Burundi', label: 'Burundi' },
                      { value: 'Cabo Verde', label: 'Cabo Verde' },
                      { value: 'Cameroon', label: 'Cameroon' },
                      { value: 'Central African Republic', label: 'Central African Republic' },
                      { value: 'Chad', label: 'Chad' },
                      { value: 'Comoros', label: 'Comoros' },
                      { value: 'Congo, Democratic Republic of the', label: 'Congo, Democratic Republic of the' },
                      { value: 'Congo, Republic of the', label: 'Congo, Republic of the' },
                      { value: "Cote d'Ivoire", label: "Cote d'Ivoire" },
                      { value: 'Djibouti', label: 'Djibouti' },
                      { value: 'Egypt', label: 'Egypt' },
                      { value: 'Equatorial Guinea', label: 'Equatorial Guinea' },
                      { value: 'Eritrea', label: 'Eritrea' },
                      { value: 'Eswatini', label: 'Eswatini' },
                      { value: 'Ethiopia', label: 'Ethiopia' },
                      { value: 'Gabon', label: 'Gabon' },
                      { value: 'Gambia', label: 'Gambia' },
                      { value: 'Ghana', label: 'Ghana' },
                      { value: 'Guinea', label: 'Guinea' },
                      { value: 'Guinea-Bissau', label: 'Guinea-Bissau' },
                      { value: 'Lesotho', label: 'Lesotho' },
                      { value: 'Liberia', label: 'Liberia' },
                      { value: 'Libya', label: 'Libya' },
                      { value: 'Madagascar', label: 'Madagascar' },
                      { value: 'Malawi', label: 'Malawi' },
                      { value: 'Mali', label: 'Mali' },
                      { value: 'Mauritania', label: 'Mauritania' },
                      { value: 'Mauritius', label: 'Mauritius' },
                      { value: 'Morocco', label: 'Morocco' },
                      { value: 'Mozambique', label: 'Mozambique' },
                      { value: 'Namibia', label: 'Namibia' },
                      { value: 'Niger', label: 'Niger' },
                      { value: 'Rwanda', label: 'Rwanda' },
                      { value: 'Sao Tome and Principe', label: 'Sao Tome and Principe' },
                      { value: 'Senegal', label: 'Senegal' },
                      { value: 'Seychelles', label: 'Seychelles' },
                      { value: 'Sierra Leone', label: 'Sierra Leone' },
                      { value: 'Somalia', label: 'Somalia' },
                      { value: 'South Sudan', label: 'South Sudan' },
                      { value: 'Sudan', label: 'Sudan' },
                      { value: 'Togo', label: 'Togo' },
                      { value: 'Tunisia', label: 'Tunisia' },
                      { value: 'Zambia', label: 'Zambia' },
                      { value: 'Zimbabwe', label: 'Zimbabwe' },               
                    ]}
                    className="react-select-container"
                    classNamePrefix="react-select"
                    theme={(theme) => ({
                      ...theme,
                      colors: {
                        ...theme.colors,
                        primary: '#FF4500',
                        primary25: '#FF450020',
                        neutral0: document.documentElement.classList.contains('dark') ? '#1a1a1a' : '#ffffff',
                        neutral80: document.documentElement.classList.contains('dark') ? '#ffffff' : '#000000',
                      },
                    })}
                  />
                  {errors.country && (
                    <p className="mt-1 text-sm text-red-500">{errors.country}</p>
                  )}
                </div>
                {formData.country === 'Kenya' && (
                  <div>
                    <label htmlFor="county" className="block text-sm font-medium mb-2">
                      County *
                    </label>
                    <Select
                      id="county"
                      value={{ value: formData.county, label: formData.county }}
                      onChange={(option) => setFormData({ ...formData, county: option?.value || '' })}
                      options={counties.map(county => ({ value: county, label: county }))}
                      className="react-select-container"
                      classNamePrefix="react-select"
                      theme={(theme) => ({
                        ...theme,
                        colors: {
                          ...theme.colors,
                          primary: '#FF4500',
                          primary25: '#FF450020',
                          neutral0: document.documentElement.classList.contains('dark') ? '#1a1a1a' : '#ffffff',
                          neutral80: document.documentElement.classList.contains('dark') ? '#ffffff' : '#000000',
                        },
                      })}
                    />
                    {errors.county && (
                      <p className="mt-1 text-sm text-red-500">{errors.county}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="industry" className="block text-sm font-medium mb-2">
                    Industry *
                  </label>
                  <Select
                    id="industry"
                    value={{ value: formData.industry, label: formData.industry }}
                    onChange={(option) => setFormData({ ...formData, industry: option?.value || '' })}
                    options={industries.map(industry => ({ value: industry, label: industry }))}
                    className="react-select-container"
                    classNamePrefix="react-select"
                    theme={(theme) => ({
                      ...theme,
                      colors: {
                        ...theme.colors,
                        primary: '#FF4500',
                        primary25: '#FF450020',
                        neutral0: document.documentElement.classList.contains('dark') ? '#1a1a1a' : '#ffffff',
                        neutral80: document.documentElement.classList.contains('dark') ? '#ffffff' : '#000000',
                      },
                    })}
                  />
                  {errors.industry && (
                    <p className="mt-1 text-sm text-red-500">{errors.industry}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="department" className="block text-sm font-medium mb-2">
                    Department *
                  </label>
                  <Select
                    id="department"
                    value={{ value: formData.department, label: formData.department }}
                    onChange={(option) => setFormData({ ...formData, department: option?.value || '' })}
                    options={departments.map(dept => ({ value: dept, label: dept }))}
                    className="react-select-container"
                    classNamePrefix="react-select"
                    theme={(theme) => ({
                      ...theme,
                      colors: {
                        ...theme.colors,
                        primary: '#FF4500',
                        primary25: '#FF450020',
                        neutral0: document.documentElement.classList.contains('dark') ? '#1a1a1a' : '#ffffff',
                        neutral80: document.documentElement.classList.contains('dark') ? '#ffffff' : '#000000',
                      },
                    })}
                  />
                  {errors.department && (
                    <p className="mt-1 text-sm text-red-500">{errors.department}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Role and Challenges */}
            <div className="space-y-6">
              <div>
                <label htmlFor="role" className="block text-sm font-medium mb-2">
                  Your Role *
                </label>
                <Select
                  id="role"
                  value={{ value: formData.role, label: formData.role }}
                  onChange={(option) => setFormData({ ...formData, role: option?.value || '' })}
                  options={roles.map(role => ({ value: role, label: role }))}
                  className="react-select-container"
                  classNamePrefix="react-select"
                  theme={(theme) => ({
                    ...theme,
                    colors: {
                      ...theme.colors,
                      primary: '#FF4500',
                      primary25: '#FF450020',
                      neutral0: document.documentElement.classList.contains('dark') ? '#1a1a1a' : '#ffffff',
                      neutral80: document.documentElement.classList.contains('dark') ? '#ffffff' : '#000000',
                    },
                  })}
                />
                {errors.role && (
                  <p className="mt-1 text-sm text-red-500">{errors.role}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-1">
                  Top Business Challenges * (Select up to 3)
                  <button
                    type="button"
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    aria-label="Help"
                    title="Select your top 3 business challenges that you'd like to address with our platform"
                  >
                    <HelpCircle className="h-4 w-4" />
                  </button>
                </label>
                <Select
                  isMulti
                  value={formData.challenges.map(c => ({ value: c, label: c }))}
                  onChange={(options) => setFormData({
                    ...formData,
                    challenges: options.map(o => o.value)
                  })}
                  options={challenges.map(challenge => ({ value: challenge, label: challenge }))}
                  className="react-select-container"
                  classNamePrefix="react-select"
                  theme={(theme) => ({
                    ...theme,
                    colors: {
                      ...theme.colors,
                      primary: '#FF4500',
                      primary25: '#FF450020',
                      neutral0: document.documentElement.classList.contains('dark') ? '#1a1a1a' : '#ffffff',
                      neutral80: document.documentElement.classList.contains('dark') ? '#ffffff' : '#000000',
                    },
                  })}
                />
                {errors.challenges && (
                  <p className="mt-1 text-sm text-red-500">{errors.challenges}</p>
                )}
              </div>
            </div>

            {/* Submit */}
            <div className="space-y-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full px-8 py-4 bg-[#FF4500] text-white rounded-lg font-semibold hover:bg-[#E63F00] transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Join Waitlist <Send className="ml-2 h-5 w-5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Contact;