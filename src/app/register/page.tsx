'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useRegister } from '@/hooks/useRegister';
import { RegisterData } from '@/lib/api';

// Country codes data
const countryCodes = [
  { code: '+251', label: '🇪🇹 Ethiopia (+251)' },
  { code: '+1', label: '🇺🇸 USA (+1)' },
  { code: '+44', label: '🇬🇧 UK (+44)' },
  { code: '+91', label: '🇮🇳 India (+91)' },
  { code: '+971', label: '🇦🇪 UAE (+971)' },
  { code: '+254', label: '🇰🇪 Kenya (+254)' },
  { code: '+27', label: '🇿🇦 South Africa (+27)' },
];

export default function RegisterPage() {
  const router = useRouter();
  const { loading, error, register } = useRegister();
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [countryCode, setCountryCode] = useState('+251');
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });
  
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [touchedFields, setTouchedFields] = useState<{[key: string]: boolean}>({});
  type TextFieldName = 'fullName' | 'email' | 'phone' | 'password' | 'confirmPassword';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      // Don't trim on change, only on submit
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    
    // Clear error when user types
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: '' }));
    }
    
    // Mark field as touched
    setTouchedFields((prev) => ({ ...prev, [name]: true }));
  };

  const handleBlur = (fieldName: TextFieldName) => {
    setTouchedFields((prev) => ({ ...prev, [fieldName]: true }));
    validateField(fieldName, formData[fieldName]);
  };

  const validateField = (name: TextFieldName, value: string): boolean => {
    let error = '';
    
    switch (name) {
      case 'fullName':
        if (!value.trim()) {
          error = 'Full name is required';
        } else if (value.trim().split(' ').length < 2) {
          error = 'Please enter your first and last name';
        } else if (!/[a-zA-Z]/.test(value)) {
          error = 'Full name must contain at least one letter';
        }
        break;
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value.trim()) {
          error = 'Email is required';
        } else if (!emailRegex.test(value)) {
          error = 'Please enter a valid email address';
        }
        break;
      case 'phone':
        if (value.trim()) {
          const phoneRegex = /^(\+?251|0)?9\d{8}$/;
          const cleanedPhone = value.replace(/\s/g, '');
          if (!phoneRegex.test(cleanedPhone)) {
            error = 'Please enter a valid Ethiopian phone number (e.g., 0912345678)';
          }
        }
        break;
      case 'password':
        if (!value) {
          error = 'Password is required';
        } else if (value.length < 8) {
          error = 'Password must be at least 8 characters';
        }
        break;
      case 'confirmPassword':
        if (!value) {
          error = 'Please confirm your password';
        } else if (value !== formData.password) {
          error = 'Passwords do not match';
        }
        break;
    }
    
    setValidationErrors((prev) => ({ ...prev, [name]: error }));
    return !error;
  };

  const getPasswordRequirements = (password: string) => {
    return {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    };
  };

  const getPasswordStrength = (password: string): { score: number; message: string; color: string } => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    if (score <= 2) return { score, message: 'Weak', color: 'text-red-500' };
    if (score <= 4) return { score, message: 'Medium', color: 'text-yellow-500' };
    return { score, message: 'Strong', color: 'text-green-500' };
  };

  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};
    let isValid = true;

    // Full Name validation
    if (!formData.fullName.trim()) {
      errors.fullName = 'Full name is required';
      isValid = false;
    } else if (formData.fullName.trim().split(' ').length < 2) {
      errors.fullName = 'Please enter your first and last name';
      isValid = false;
    } else if (!/[a-zA-Z]/.test(formData.fullName)) {
      errors.fullName = 'Full name must contain at least one letter';
      isValid = false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
      isValid = false;
    }

    // Phone validation (optional but validate if provided)
    if (formData.phone && formData.phone.trim()) {
      const phoneRegex = /^(\+?251|0)?9\d{8}$/;
      const cleanedPhone = formData.phone.replace(/\s/g, '');
      if (!phoneRegex.test(cleanedPhone)) {
        errors.phone = 'Please enter a valid Ethiopian phone number (e.g., 0912345678)';
        isValid = false;
      }
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
      isValid = false;
    } else if (!/(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[^A-Za-z0-9])/.test(formData.password)) {
      errors.password = 'Password must include uppercase, lowercase, number, and special character';
      isValid = false;
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    // Terms validation
    if (!formData.agreeToTerms) {
      errors.agreeToTerms = 'You must agree to the Terms and Conditions';
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const nameParts = formData.fullName.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ');

    const registerData: RegisterData = {
      user: {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        first_name: firstName,
        last_name: lastName,
      },
      phone: formData.phone ? `${countryCode}${formData.phone.replace(/\s/g, '')}` : undefined,
    };

    try {
      await register(registerData);
      router.push(`/verify-email?email=${encodeURIComponent(formData.email)}`);
    } catch (err: any) {
      if (!err.response) {
        setValidationErrors({ submit: 'Unable to connect. Please check your internet connection and try again.' });
      }
    }
  };

  const passwordRequirements = getPasswordRequirements(formData.password);
  const passwordStrength = formData.password ? getPasswordStrength(formData.password) : null;

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Image with Overlay */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden">
        <Image
          src="/images/registerimg.png"
          alt="ServiaAI registration background"
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
        />
        <div 
          className="absolute inset-0"
          style={{ backgroundColor: 'rgba(32, 94, 101, 0.5)' }}
        />
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-3xl font-bold" style={{ color: '#26B9C8' }}>
              Create your account
            </h1>
            <p className="mt-2" style={{ color: '#26B9C8' }}>
              Start your journey
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error Alert */}
            {(error || validationErrors.submit) && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error || validationErrors.submit}
              </div>
            )}

            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                onBlur={() => handleBlur('fullName')}
                placeholder="Enter your full name"
                maxLength={100}
                className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition ${
                  validationErrors.fullName ? 'border-red-500' : 'border-gray-300'
                }`}
                style={{ 
                  backgroundColor: touchedFields.fullName ? '#ffffff' : '#D9E4EA', 
                  color: '#1a202c',
                }}
              />
              {validationErrors.fullName && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.fullName}</p>
              )}
            </div>

            {/* Email Address */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={() => handleBlur('email')}
                placeholder="name@company.com"
                maxLength={254}
                className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition ${
                  validationErrors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                style={{ 
                  backgroundColor: touchedFields.email ? '#ffffff' : '#D9E4EA', 
                  color: '#1a202c',
                }}
              />
              {validationErrors.email && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
              )}
            </div>

            {/* Phone Number with Country Code */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number <span className="text-gray-400">(Optional)</span>
              </label>
              <div className="flex gap-2">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="px-3 py-3 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  style={{ minWidth: '120px' }}
                >
                  {countryCodes.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.label}
                    </option>
                  ))}
                </select>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  onBlur={() => handleBlur('phone')}
                  placeholder="912345678"
                  maxLength={15}
                  className={`flex-1 px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition ${
                    validationErrors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  style={{ 
                    backgroundColor: touchedFields.phone ? '#ffffff' : '#D9E4EA', 
                    color: '#1a202c',
                  }}
                />
              </div>
              {validationErrors.phone && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.phone}</p>
              )}
            </div>

            {/* Password with Toggle */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={() => handleBlur('password')}
                  placeholder="Min. 8 characters"
                  maxLength={128}
                  className={`w-full px-4 py-3 pl-11 pr-11 rounded-lg border focus:outline-none focus:ring-2 transition ${
                    validationErrors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  style={{ 
                    backgroundColor: touchedFields.password ? '#ffffff' : '#D9E4EA', 
                    color: '#1a202c',
                  }}
                />
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              
              {/* Password Requirements Checklist */}
              {formData.password && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    <span className={passwordRequirements.length ? 'text-green-600' : 'text-gray-400'}>
                      {passwordRequirements.length ? '✓' : '○'}
                    </span>
                    <span className={passwordRequirements.length ? 'text-gray-700' : 'text-gray-400'}>
                      At least 8 characters
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className={passwordRequirements.uppercase ? 'text-green-600' : 'text-gray-400'}>
                      {passwordRequirements.uppercase ? '✓' : '○'}
                    </span>
                    <span className={passwordRequirements.uppercase ? 'text-gray-700' : 'text-gray-400'}>
                      One uppercase letter
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className={passwordRequirements.lowercase ? 'text-green-600' : 'text-gray-400'}>
                      {passwordRequirements.lowercase ? '✓' : '○'}
                    </span>
                    <span className={passwordRequirements.lowercase ? 'text-gray-700' : 'text-gray-400'}>
                      One lowercase letter
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className={passwordRequirements.number ? 'text-green-600' : 'text-gray-400'}>
                      {passwordRequirements.number ? '✓' : '○'}
                    </span>
                    <span className={passwordRequirements.number ? 'text-gray-700' : 'text-gray-400'}>
                      One number
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className={passwordRequirements.special ? 'text-green-600' : 'text-gray-400'}>
                      {passwordRequirements.special ? '✓' : '○'}
                    </span>
                    <span className={passwordRequirements.special ? 'text-gray-700' : 'text-gray-400'}>
                      One special character
                    </span>
                  </div>
                  <div className={`mt-1 text-xs font-medium ${passwordStrength?.color}`}>
                    Password strength: {passwordStrength?.message}
                  </div>
                </div>
              )}
              {validationErrors.password && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.password}</p>
              )}
            </div>

            {/* Confirm Password with Toggle */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={() => handleBlur('confirmPassword')}
                  placeholder="Re-enter password"
                  maxLength={128}
                  className={`w-full px-4 py-3 pl-11 pr-11 rounded-lg border focus:outline-none focus:ring-2 transition ${
                    validationErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                  style={{ 
                    backgroundColor: touchedFields.confirmPassword ? '#ffffff' : '#D9E4EA', 
                    color: '#1a202c',
                  }}
                />
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {validationErrors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.confirmPassword}</p>
              )}
            </div>

            {/* Terms Checkbox */}
            <div>
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="agreeToTerms"
                    name="agreeToTerms"
                    type="checkbox"
                    checked={formData.agreeToTerms}
                    onChange={handleChange}
                    className="w-4 h-4 border border-gray-300 rounded focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="agreeToTerms" className="text-gray-600">
                    I agree to the{' '}
                    <Link href="/terms" className="text-teal-600 hover:text-teal-500 font-medium" target="_blank">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="text-teal-600 hover:text-teal-500 font-medium" target="_blank">
                      Privacy Policy
                    </Link>
                    .
                  </label>
                </div>
              </div>
              {validationErrors.agreeToTerms && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.agreeToTerms}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full text-white font-semibold py-3 px-4 rounded-lg shadow-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              style={{ backgroundColor: '#26B9C8' }}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          {/* Login Link */}
          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="font-medium" style={{ color: '#26B9C8' }}>
              Login here
            </Link>
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-50 border-t border-gray-200 p-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-600">
            <span className="font-semibold">ServiaAI</span>
            <span className="mx-2">© 2026 ServiaAI. The Ultimate Career Experience.</span>
          </div>
          <div className="flex gap-6 text-sm text-gray-600">
            <Link href="/terms" className="hover:text-teal-600 transition" target="_blank">
              Terms of Service
            </Link>
            <Link href="/privacy" className="hover:text-teal-600 transition" target="_blank">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
