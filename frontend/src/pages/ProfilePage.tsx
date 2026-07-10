import { useState, useEffect } from 'react';
import { User as UserIcon, Shield, AlertTriangle } from 'lucide-react';
import { CustomerProfile } from '../types';

export default function ProfilePage() {
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [updating, setUpdating] = useState<boolean>(false);
  const [submittingKyc, setSubmittingKyc] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('Canada');

  // KYC Form states
  const [docType, setDocType] = useState('PASSPORT');
  const [docNumber, setDocNumber] = useState('');

  // Fetch profile
  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/customers/me', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        populateForm(data);
      } else {
        // Fallback for UI standalone demo
        const mockProfile: CustomerProfile = {
          customerId: 101,
          userId: 1,
          email: 'customer@maplecore.ca',
          firstName: 'Pierre',
          lastName: 'Trudeau',
          phoneNumber: '6135550199',
          address: {
            streetAddress: '24 Sussex Dr',
            city: 'Ottawa',
            province: 'ON',
            postalCode: 'K1M 1M4',
            country: 'Canada'
          },
          status: 'PENDING_KYC',
          kycStatus: 'NOT_STARTED'
        };
        setProfile(mockProfile);
        populateForm(mockProfile);
      }
    } catch (err) {
      // Offline fallback
      const mockProfile: CustomerProfile = {
        customerId: 101,
        userId: 1,
        email: 'customer@maplecore.ca',
        firstName: 'Pierre',
        lastName: 'Trudeau',
        phoneNumber: '6135550199',
        address: {
          streetAddress: '24 Sussex Dr',
          city: 'Ottawa',
          province: 'ON',
          postalCode: 'K1M 1M4',
          country: 'Canada'
        },
        status: 'PENDING_KYC',
        kycStatus: 'NOT_STARTED'
      };
      setProfile(mockProfile);
      populateForm(mockProfile);
    } finally {
      setLoading(false);
    }
  };

  const populateForm = (data: CustomerProfile) => {
    setFirstName(data.firstName || '');
    setLastName(data.lastName || '');
    setPhoneNumber(data.phoneNumber || '');
    if (data.address) {
      setStreetAddress(data.address.streetAddress || '');
      setCity(data.address.city || '');
      setProvince(data.address.province || '');
      setPostalCode(data.address.postalCode || '');
      setCountry(data.address.country || 'Canada');
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setError(null);
    setSuccess(null);

    const payload = {
      firstName,
      lastName,
      phoneNumber,
      address: {
        streetAddress,
        city,
        province,
        postalCode,
        country
      }
    };

    try {
      const res = await fetch('/api/v1/customers/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const updated = await res.json();
        setProfile(updated);
        setSuccess('Profile updated successfully.');
      } else {
        setError('Failed to update profile. Please verify your address inputs.');
      }
    } catch (err) {
      // Handle locally for preview
      setProfile(prev => prev ? { ...prev, ...payload } : null);
      setSuccess('Profile updated successfully (Demo Sandbox Mode).');
    } finally {
      setUpdating(false);
    }
  };

  const handleSubmitKyc = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingKyc(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/v1/customers/me/kyc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          documentType: docType,
          documentNumber: docNumber
        })
      });

      if (res.ok) {
        setSuccess('KYC documents submitted successfully. Pending Compliance review.');
        if (profile) setProfile({ ...profile, kycStatus: 'PENDING_REVIEW' });
      } else {
        const errData = await res.json();
        setError(errData.message || 'KYC submission failed.');
      }
    } catch (err) {
      setSuccess('KYC documents submitted (Demo Sandbox Mode).');
      if (profile) setProfile({ ...profile, kycStatus: 'PENDING_REVIEW' });
    } finally {
      setSubmittingKyc(false);
      setDocNumber('');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-red-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-6 px-4">
      {/* Warning banner */}
      <div className="bg-brand-red-50 border border-brand-red-100 rounded-2xl p-4 flex items-start space-x-3 shadow-sm">
        <AlertTriangle className="text-brand-red-500 flex-shrink-0 mt-0.5" size={20} />
        <div>
          <h4 className="text-sm font-semibold text-brand-red-900">Demonstration Platform</h4>
          <p className="text-xs text-brand-red-700 mt-0.5">
            MapleCore is a testing core banking sandbox using fictional data. Do not enter real passports, social insurance numbers, or identification records.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left column - Status overview */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white border border-brand-grey-200 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-brand-charcoal-50 text-brand-charcoal-800 text-2xl font-bold">
                {firstName ? firstName[0] : 'U'}
              </div>
              <h3 className="font-bold text-lg text-brand-charcoal-800">
                {firstName} {lastName}
              </h3>
              <p className="text-xs text-brand-grey-500">{profile?.email}</p>
            </div>

            <hr className="border-brand-grey-100" />

            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-brand-grey-500">Profile Status:</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  profile?.status === 'ACTIVE' 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                }`}>
                  {profile?.status}
                </span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-brand-grey-500">Identity KYC:</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  profile?.kycStatus === 'VERIFIED' 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : profile?.kycStatus === 'PENDING_REVIEW'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'bg-gray-100 text-gray-700 border border-gray-200'
                }`}>
                  {profile?.kycStatus}
                </span>
              </div>
            </div>
          </div>

          {/* KYC Submission panel if not verified */}
          {profile?.kycStatus !== 'VERIFIED' && profile?.kycStatus !== 'PENDING_REVIEW' && (
            <div className="bg-white border border-brand-grey-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 text-brand-red-500 font-bold text-sm">
                <Shield size={18} />
                <span>Verify Your Identity</span>
              </div>
              <p className="text-xs text-brand-grey-500 leading-relaxed">
                Submit fictional identity document references to activate account creations and transfers.
              </p>
              <form onSubmit={handleSubmitKyc} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-semibold text-brand-grey-500">Document Type</label>
                  <select 
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    className="w-full bg-brand-grey-50 border border-brand-grey-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-brand-red-500 focus:outline-none"
                  >
                    <option value="PASSPORT">Canadian Passport</option>
                    <option value="DRIVERS_LICENSE">Provincial Driver's License</option>
                    <option value="PR_CARD">Permanent Resident Card</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-semibold text-brand-grey-500">Document number</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. AA123456"
                    value={docNumber}
                    onChange={(e) => setDocNumber(e.target.value)}
                    className="w-full bg-brand-grey-50 border border-brand-grey-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-brand-red-500 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submittingKyc}
                  className="w-full bg-brand-red-500 hover:bg-brand-red-600 text-white font-semibold text-xs py-2 rounded-xl transition-colors disabled:opacity-50"
                >
                  {submittingKyc ? 'Submitting...' : 'Submit KYC Details'}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Right column - profile edits */}
        <div className="md:col-span-2 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-700 text-sm px-4 py-2.5 rounded-xl">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-100 text-green-700 text-sm px-4 py-2.5 rounded-xl">
              {success}
            </div>
          )}

          <div className="bg-white border border-brand-grey-200 rounded-2xl p-6 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-brand-charcoal-800 flex items-center space-x-2">
              <UserIcon className="text-brand-red-500" size={20} />
              <span>Personal Details</span>
            </h3>

            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-semibold text-brand-grey-500">First Name</label>
                  <input 
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full bg-brand-grey-50 border border-brand-grey-200 rounded-xl px-3.5 py-2.5 text-xs focus:ring-1 focus:ring-brand-red-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-semibold text-brand-grey-500">Last Name</label>
                  <input 
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full bg-brand-grey-50 border border-brand-grey-200 rounded-xl px-3.5 py-2.5 text-xs focus:ring-1 focus:ring-brand-red-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider font-semibold text-brand-grey-500">Phone Number</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. 6135550199"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full bg-brand-grey-50 border border-brand-grey-200 rounded-xl px-3.5 py-2.5 text-xs focus:ring-1 focus:ring-brand-red-500 focus:outline-none"
                />
              </div>

              <hr className="border-brand-grey-100" />

              <h4 className="text-sm font-semibold text-brand-charcoal-800">Mailing Address</h4>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-semibold text-brand-grey-500">Street Address</label>
                  <input 
                    type="text"
                    required
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    className="w-full bg-brand-grey-50 border border-brand-grey-200 rounded-xl px-3.5 py-2.5 text-xs focus:ring-1 focus:ring-brand-red-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider font-semibold text-brand-grey-500">City</label>
                    <input 
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-brand-grey-50 border border-brand-grey-200 rounded-xl px-3.5 py-2.5 text-xs focus:ring-1 focus:ring-brand-red-500 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider font-semibold text-brand-grey-500">Province</label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. ON"
                      value={province}
                      onChange={(e) => setProvince(e.target.value)}
                      className="w-full bg-brand-grey-50 border border-brand-grey-200 rounded-xl px-3.5 py-2.5 text-xs focus:ring-1 focus:ring-brand-red-500 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider font-semibold text-brand-grey-500">Postal Code</label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. K1A 0B1"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="w-full bg-brand-grey-50 border border-brand-grey-200 rounded-xl px-3.5 py-2.5 text-xs focus:ring-1 focus:ring-brand-red-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={updating}
                className="py-2.5 px-6 bg-brand-red-500 hover:bg-brand-red-600 text-white font-semibold rounded-xl text-xs shadow-md shadow-brand-red-500/10 transition-colors disabled:opacity-50"
              >
                {updating ? 'Saving Details...' : 'Save Profile Changes'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
