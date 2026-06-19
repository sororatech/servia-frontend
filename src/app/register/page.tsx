'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Lock, Eye, EyeOff, ChevronDown } from 'lucide-react';
import { useRegister } from '@/hooks/useRegister';
import { RegisterData } from '@/lib/api';
import { countries, getCountryByDialCode, isValidPhoneNumber } from '@/lib/countries';
import { Footer } from '@/components/ui';
import { Button } from '@/components/ui';

export default function RegisterPage() {
  const router = useRouter();
  const { loading, error, register } = useRegister();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
  const [countryCode, setCountryCode] = useState('+251');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const countryDropdownRef = useRef<HTMLDivElement>(null);

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

  const selectedCountry = useMemo(() => {
    return getCountryByDialCode(countryCode) || countries[0];
  }, [countryCode]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target as Node)) {
        setShowCountryDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: '' }));
    }
    setTouchedFields((prev) => ({ ...prev, [name]: true }));
  };

  const handleBlur = (fieldName: keyof typeof formData) => {
    setTouchedFields((prev) => ({ ...prev, [fieldName]: true }));
    validateField(fieldName, formData[fieldName]);

    if (fieldName === 'password') {
      setTimeout(() => setShowPasswordRequirements(false), 300);
    }
  };

  const validateField = (name: keyof typeof formData, value: string | boolean): boolean => {
    let error = '';
    if (typeof value === 'boolean') {
      if (name === 'agreeToTerms' && !value) error = 'You must agree to the Terms';
      setValidationErrors((prev) => ({ ...prev, [name]: error }));
      return !error;
    }
    switch (name) {
      case 'fullName':
        if (!value.trim()) error = 'Full name is required';
        else if (value.trim().split(' ').length < 2) error = 'Please enter your first and last name';
        else if (!/[a-zA-Z]/.test(value)) error = 'Full name must contain at least one letter';
        break;
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value.trim()) error = 'Email is required';
        else if (!emailRegex.test(value)) error = 'Please enter a valid email address';
        break;
      case 'phone':
        if (value.trim() && !isValidPhoneNumber(value, selectedCountry.code)) {
          error = `Please enter a valid ${selectedCountry.name} phone number`;
        }
        break;
      case 'password':
        if (!value) error = 'Password is required';
        else if (value.length < 8) error = 'Password must be at least 8 characters';
        break;
      case 'confirmPassword':
        if (!value) error = 'Please confirm your password';
        else if (value !== formData.password) error = 'Passwords do not match';
        break;
    }
    setValidationErrors((prev) => ({ ...prev, [name]: error }));
    return !error;
  };

  const getPasswordRequirements = (password: string) => ({
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  });

  const getPasswordStrength = (password: string) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (score <= 2) return { message: 'Weak', color: 'text-red-500' };
    if (score <= 4) return { message: 'Medium', color: 'text-yellow-500' };
    return { message: 'Strong', color: 'text-green-500' };
  };

  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};
    let isValid = true;
    if (!formData.fullName.trim()) { errors.fullName = 'Full name is required'; isValid = false; }
    else if (formData.fullName.trim().split(' ').length < 2) { errors.fullName = 'Please enter your first and last name'; isValid = false; }
    else if (!/[a-zA-Z]/.test(formData.fullName)) { errors.fullName = 'Full name must contain at least one letter'; isValid = false; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) { errors.email = 'Email is required'; isValid = false; }
    else if (!emailRegex.test(formData.email)) { errors.email = 'Please enter a valid email address'; isValid = false; }
    if (formData.phone && formData.phone.trim() && !isValidPhoneNumber(formData.phone, selectedCountry.code)) {
      errors.phone = `Please enter a valid ${selectedCountry.name} phone number`;
      isValid = false;
    }
    if (!formData.password) { errors.password = 'Password is required'; isValid = false; }
    else if (formData.password.length < 8) { errors.password = 'Password must be at least 8 characters'; isValid = false; }
    else if (!/(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[^A-Za-z0-9])/.test(formData.password)) {
      errors.password = 'Password must include uppercase, lowercase, number, and special character';
      isValid = false;
    }
    if (!formData.confirmPassword) { errors.confirmPassword = 'Please confirm your password'; isValid = false; }
    else if (formData.password !== formData.confirmPassword) { errors.confirmPassword = 'Passwords do not match'; isValid = false; }
    if (!formData.agreeToTerms) { errors.agreeToTerms = 'You must agree to the Terms and Conditions'; isValid = false; }
    setValidationErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
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
      phone: formData.phone ? `${countryCode}${formData.phone.replace(/\D/g, '')}` : undefined,
    };
    try {
      await register(registerData);
      router.push(`/verify-email?email=${encodeURIComponent(formData.email)}`);
      router.refresh();
    } catch (err: any) {
      if (!err.response) {
        setValidationErrors({ submit: 'Unable to connect. Please check your internet connection and try again.' });
      }
    }
  };

  const handleCountrySelect = (country: typeof countries[0]) => {
    setCountryCode(country.dialCode);
    setShowCountryDropdown(false);
  };

  const passwordReqs = getPasswordRequirements(formData.password);
  const passwordStrength = formData.password ? getPasswordStrength(formData.password) : null;

  return (
    <div className="min-h-screen flex flex-col overflow-hidden">
      <div className="flex flex-1 overflow-hidden">
        <div className="hidden lg:flex lg:w-[45%] relative items-center justify-center overflow-hidden">
          <Image
            src="/images/registerimg.png"
            alt="ServiaAI background"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 45vw"
            priority
          />
          <div className="absolute inset-0" style={{ backgroundColor: 'rgba(32, 94, 101, 0.5)' }} />
        </div>

        <div className="w-full lg:w-[55%] flex items-center justify-center p-4 sm:p-6 lg:p-10 bg-[var(--color-background)] overflow-y-auto">
          <div className="w-full max-w-lg">
            <div className="mb-8 sm:mb-10">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold" style={{ color: 'var(--color-secondary)' }}>Create your account</h2>
              <p className="-mt-3" style={{ color: 'var(--color-primary)' }}>Start your journey</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-7">
              {(error || validationErrors.submit) && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error || validationErrors.submit}</div>
              )}

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Full Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  onBlur={() => handleBlur('fullName')}
                  placeholder="Enter your full name"
                  maxLength={100}
                  className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition text-sm sm:text-base ${validationErrors.fullName ? 'border-red-500' : 'border-gray-300'}`}
                  style={{ backgroundColor: touchedFields.fullName ? '#ffffff' : 'var(--color-input-bg)', color: 'var(--color-text-darkest)' }}
                />
                {validationErrors.fullName && <p className="text-sm text-red-600">{validationErrors.fullName}</p>}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Email Address <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={() => handleBlur('email')}
                  placeholder="name@company.com"
                  maxLength={254}
                  className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition text-sm sm:text-base ${validationErrors.email ? 'border-red-500' : 'border-gray-300'}`}
                  style={{ backgroundColor: touchedFields.email ? '#ffffff' : 'var(--color-input-bg)', color: 'var(--color-text-darkest)' }}
                />
                {validationErrors.email && <p className="text-sm text-red-600">{validationErrors.email}</p>}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                <div className="flex gap-1.5 sm:gap-2">
                  <div className="relative flex-shrink-0" ref={countryDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                      className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-3 rounded-lg border border-gray-300 bg-[var(--color-background)] hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500 transition w-[84px] sm:w-[110px]"
                    >
                      <span className="text-lg sm:text-xl leading-none">{selectedCountry.flag}</span>
                      <span className="text-xs sm:text-sm font-medium text-gray-700 truncate">{countryCode}</span>
                      <ChevronDown className={`w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0 transition-transform ${showCountryDropdown ? 'rotate-180' : ''}`} />
                    </button>

                    {showCountryDropdown && (
                      <div className="absolute z-50 mt-1 w-64 sm:w-72 max-h-60 sm:max-h-64 overflow-y-auto bg-[var(--color-background)] border border-gray-200 rounded-lg shadow-lg">
                        {countries.map((country) => (
                          <button
                            key={country.code}
                            type="button"
                            onClick={() => handleCountrySelect(country)}
                            className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 hover:bg-gray-50 transition text-left ${countryCode === country.dialCode ? 'bg-teal-50' : ''}`}
                          >
                            <span className="text-lg sm:text-xl">{country.flag}</span>
                            <span className="flex-1 text-xs sm:text-sm text-gray-700 truncate">{country.name}</span>
                            <span className="text-xs sm:text-sm text-gray-500 flex-shrink-0">{country.dialCode}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    onBlur={() => handleBlur('phone')}
                    placeholder="Phone number"
                    maxLength={15}
                    className={`flex-1 min-w-0 px-3 sm:px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition text-sm sm:text-base ${validationErrors.phone ? 'border-red-500' : 'border-gray-300'}`}
                    style={{ backgroundColor: touchedFields.phone ? '#ffffff' : 'var(--color-input-bg)', color: 'var(--color-text-darkest)' }}
                  />
                </div>
                {validationErrors.phone && <p className="text-sm text-red-600">{validationErrors.phone}</p>}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Password <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={(e) => {
                      handleChange(e);
                      if (e.target.value.length > 0) {
                        setShowPasswordRequirements(true);
                      }
                    }}
                    onBlur={() => handleBlur('password')}
                    placeholder="Enter password"
                    maxLength={128}
                    className={`w-full px-4 py-3 pl-11 pr-11 rounded-lg border focus:outline-none focus:ring-2 transition text-sm sm:text-base ${validationErrors.password ? 'border-red-500' : 'border-gray-300'}`}
                    style={{ backgroundColor: touchedFields.password ? '#ffffff' : 'var(--color-input-bg)', color: 'var(--color-text-darkest)' }}
                  />
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 pointer-events-none" color="var(--color-primary)" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 focus:outline-none p-0.5"
                    style={{ color: 'var(--color-primary)' }}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                    ) : (
                      <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                  </button>
                </div>

                {showPasswordRequirements && formData.password && (
                  <div className="mt-2 space-y-1 animate-fadeIn">
                    {[
                      { met: passwordReqs.length, text: 'At least 8 characters' },
                      { met: passwordReqs.uppercase, text: 'One uppercase letter' },
                      { met: passwordReqs.lowercase, text: 'One lowercase letter' },
                      { met: passwordReqs.number, text: 'One number' },
                      { met: passwordReqs.special, text: 'One special character' },
                    ].map((req, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <span className={req.met ? 'text-green-600' : 'text-gray-400'}>{req.met ? '✓' : '○'}</span>
                        <span className={req.met ? 'text-gray-700' : 'text-gray-400'}>{req.text}</span>
                      </div>
                    ))}
                    <div className={`mt-1.5 text-xs font-medium ${passwordStrength?.color}`}>Password strength: {passwordStrength?.message}</div>
                  </div>
                )}
                {validationErrors.password && <p className="text-sm text-red-600">{validationErrors.password}</p>}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Confirm Password <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onBlur={() => handleBlur('confirmPassword')}
                    placeholder="Re-enter password"
                    maxLength={128}
                    className={`w-full px-4 py-3 pl-11 pr-11 rounded-lg border focus:outline-none focus:ring-2 transition text-sm sm:text-base ${validationErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
                    style={{ backgroundColor: touchedFields.confirmPassword ? '#ffffff' : 'var(--color-input-bg)', color: 'var(--color-text-darkest)' }}
                  />
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 pointer-events-none" color="var(--color-primary)" />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 focus:outline-none p-0.5"
                    style={{ color: 'var(--color-primary)' }}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                    ) : (
                      <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                  </button>
                </div>
                {validationErrors.confirmPassword && <p className="text-sm text-red-600">{validationErrors.confirmPassword}</p>}
              </div>

              <div className="space-y-2">
                <div className="flex items-start">
                  <input
                    id="agreeToTerms"
                    name="agreeToTerms"
                    type="checkbox"
                    checked={formData.agreeToTerms}
                    onChange={handleChange}
                    className="w-4 h-4 mt-0.5 flex-shrink-0 border border-gray-300 rounded focus:ring-2 focus:ring-teal-500"
                  />
                  <label htmlFor="agreeToTerms" className="ml-2 text-sm text-gray-600">
                    I agree to the <Link href="/terms-of-service" className="font-medium" style={{ color: 'var(--color-primary)' }} target="_blank">Terms of Service</Link> and <Link href="/privacy-policy" className="font-medium" style={{ color: 'var(--color-primary)' }} target="_blank">Privacy Policy</Link>.
                  </label>
                </div>
                {validationErrors.agreeToTerms && <p className="text-sm text-red-600">{validationErrors.agreeToTerms}</p>}
              </div>

              <Button
                type="submit"
                disabled={loading}
                variant="primary"
                size="lg"
                fullWidth
                className="mt-3 custom-button"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>

            <p className="mt-5 text-center text-sm text-gray-600">
              Already have an account? <Link href="/login" className="font-medium" style={{ color: 'var(--color-primary)' }}>Login here</Link>
            </p>
          </div>
        </div>
      </div>
      <Footer />
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .custom-button {
          background-color: var(--color-primary) !important;
          height: 48px !important;
          min-height: 48px !important;
          padding: 0 1.5rem !important;
          border-radius: 9999px !important;
        }
        .custom-button:hover {
          background-color: var(--color-primary-hover) !important;
          opacity: 0.95 !important;
        }
        .custom-button:disabled {
          opacity: 0.6 !important;
        }
      `}</style>
    </div>
  );
}
