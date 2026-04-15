import React, { useState } from 'react';
import { User, Lock, Save, Eye, EyeOff, Mail, Phone, IndianRupee } from 'lucide-react';
import { userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const CURRENCIES = ['₹', '$', '€', '£', '¥', '₩', '₦', 'AED'];

export default function ProfilePage() {
  const { user, updateUser } = useAuth();

  const [profileForm, setProfileForm] = useState({
    name:     user?.name     || '',
    phone:    user?.phone    || '',
    currency: user?.currency || '₹',
    avatar:   user?.avatar   || '',
  });
  const [pwForm, setPwForm]       = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [showPw,   setShowPw]     = useState({ current: false, newPw: false, confirm: false });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPw,      setSavingPw]      = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const setP = (k, v) => setProfileForm((p) => ({ ...p, [k]: v }));
  const setPw = (k, v) => setPwForm((p) => ({ ...p, [k]: v }));

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!profileForm.name.trim()) { toast.error('Name is required'); return; }
    setSavingProfile(true);
    try {
      const { data } = await userAPI.updateProfile(profileForm);
      updateUser(data.data);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setSavingProfile(false); }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (!pwForm.currentPassword) { toast.error('Enter your current password'); return; }
    if (pwForm.newPassword.length < 6) { toast.error('New password must be at least 6 characters'); return; }
    if (pwForm.newPassword !== pwForm.confirm) { toast.error('Passwords do not match'); return; }
    setSavingPw(true);
    try {
      await userAPI.changePassword({
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      toast.success('Password changed successfully!');
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally { setSavingPw(false); }
  };

  const togglePw = (field) => setShowPw((p) => ({ ...p, [field]: !p[field] }));

  const PwInput = ({ label, field, pwKey }) => (
    <div>
      <label className="label">{label}</label>
      <div className="relative">
        <input className="input pr-11" type={showPw[field] ? 'text' : 'password'}
          required placeholder="••••••••"
          value={pwForm[pwKey]} onChange={(e) => setPw(pwKey, e.target.value)} />
        <button type="button" onClick={() => togglePw(field)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
          {showPw[field] ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Manage your account settings</p>
      </div>

      {/* User card */}
      <div className="card flex items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-700 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0 shadow-lg">
          {user?.name?.[0]?.toUpperCase() || 'U'}
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">{user?.name}</h2>
          <div className="flex items-center gap-1 text-gray-400 text-sm mt-0.5">
            <Mail size={13} />
            <span>{user?.email}</span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit">
        {[
          { id: 'profile',  label: 'Edit Profile', icon: User },
          { id: 'security', label: 'Security',      icon: Lock },
        ].map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === id
                ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}>
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* Profile form */}
      {activeTab === 'profile' && (
        <div className="card">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-5">Personal Information</h2>
          <form onSubmit={handleProfileSave} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input className="input" required placeholder="Your name"
                value={profileForm.name} onChange={(e) => setP('name', e.target.value)} />
            </div>

            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input className="input pl-9 bg-gray-50 dark:bg-gray-800 cursor-not-allowed"
                  value={user?.email} disabled />
              </div>
              <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="label">Phone Number</label>
              <div className="relative">
                <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input className="input pl-9" placeholder="+91 98765 43210"
                  value={profileForm.phone} onChange={(e) => setP('phone', e.target.value)} />
              </div>
            </div>

            <div>
              <label className="label">Currency Symbol</label>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {CURRENCIES.map((c) => (
                  <button key={c} type="button" onClick={() => setP('currency', c)}
                    className={`py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                      profileForm.currency === c
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                    }`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" disabled={savingProfile} className="btn-primary">
              <Save size={16} />
              {savingProfile ? 'Saving…' : 'Save Changes'}
            </button>
          </form>
        </div>
      )}

      {/* Security / password form */}
      {activeTab === 'security' && (
        <div className="card">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-5">Change Password</h2>
          <form onSubmit={handlePasswordSave} className="space-y-4">
            <PwInput label="Current Password" field="current" pwKey="currentPassword" />
            <PwInput label="New Password (min. 6 characters)" field="newPw"   pwKey="newPassword" />
            <PwInput label="Confirm New Password"             field="confirm" pwKey="confirm" />

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-3">
              <p className="text-xs text-blue-700 dark:text-blue-400">
                💡 Tips: Use a mix of letters, numbers, and symbols. Avoid using personal info.
              </p>
            </div>

            <button type="submit" disabled={savingPw} className="btn-primary">
              <Lock size={16} />
              {savingPw ? 'Changing…' : 'Change Password'}
            </button>
          </form>
        </div>
      )}

      {/* Danger zone */}
      <div className="card border border-red-100 dark:border-red-900/30">
        <h2 className="text-base font-semibold text-red-600 dark:text-red-400 mb-2">Danger Zone</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
          Once you delete your account, all your data will be permanently removed and cannot be recovered.
        </p>
        <button className="btn-danger btn-sm" disabled>
          Delete Account (contact admin)
        </button>
      </div>
    </div>
  );
}
