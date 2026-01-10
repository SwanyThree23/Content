import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Shield, User, Bell } from 'lucide-react';
import toast from 'react-hot-toast';

export function Settings() {
  const { user } = useAuthStore();
  const [fullName, setFullName] = useState(user?.full_name || '');

  const saveProfile = () => {
    toast.success('Profile updated');
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-3xl font-bold">Settings</h1>

      <Card>
        <div className="flex items-center gap-3 mb-6">
          <User size={20} />
          <h2 className="text-xl font-semibold">Profile</h2>
        </div>
        <div className="space-y-4">
          <Input label="Full Name" value={fullName} onChange={e => setFullName(e.target.value)} />
          <Input label="Email" value={user?.email} disabled />
          <Button onClick={saveProfile}>Save Changes</Button>
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-3 mb-6">
          <Shield size={20} />
          <h2 className="text-xl font-semibold">Security</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Two-Factor Authentication</p>
              <p className="text-sm text-gray-600">Add extra security to your account</p>
            </div>
            <Button size="sm">Enable 2FA</Button>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-3 mb-6">
          <Bell size={20} />
          <h2 className="text-xl font-semibold">Notifications</h2>
        </div>
        <div className="space-y-3">
          {['Email notifications', 'Payment alerts', 'Usage warnings'].map(item => (
            <label key={item} className="flex items-center gap-3">
              <input type="checkbox" className="w-4 h-4 rounded" defaultChecked />
              <span>{item}</span>
            </label>
          ))}
        </div>
      </Card>
    </div>
  );
}
