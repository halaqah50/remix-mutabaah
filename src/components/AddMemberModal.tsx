import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { addMember } from '../lib/storage';
import { UserPlus, X, ShieldCheck, Phone, Mail } from 'lucide-react';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMemberAdded: (member: User) => void;
}

export const AddMemberModal: React.FC<AddMemberModalProps> = ({
  isOpen,
  onClose,
  onMemberAdded,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('member');
  const [tilawahSheets, setTilawahSheets] = useState(10);
  const [qiyamWeekly, setQiyamWeekly] = useState(2);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Nama anggota wajib diisi');
      return;
    }

    const newMember = addMember({
      name: name.trim(),
      email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '.')}@cm3105.org`,
      phone: phone.trim(),
      role,
      targetTilawahSheets: tilawahSheets,
      targetQiyamulailWeekly: qiyamWeekly,
      avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 100000)}?w=150`,
    });

    onMemberAdded(newMember);
    alert(`Anggota "${newMember.name}" berhasil ditambahkan ke CM3105!`);
    setName('');
    setEmail('');
    setPhone('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-emerald-100 animate-in fade-in zoom-in duration-200 relative">
        
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-2xl flex items-center justify-center">
            <UserPlus className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-xl text-emerald-950">Tambah Anggota CM3105</h3>
            <p className="text-xs text-gray-500">Registrasi anggota baru ke dalam kelompok mutabaah</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-gray-800 mb-1">Nama Lengkap Anggota *</label>
            <input
              type="text"
              required
              placeholder="misal: Umar Bin Khattab"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">No. WhatsApp</label>
              <input
                type="text"
                placeholder="08123456789"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-300 outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Akses Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full p-2.5 rounded-xl border border-gray-300 outline-none font-bold text-gray-800"
              >
                <option value="member">User Member</option>
                <option value="admin">User Admin</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 bg-emerald-50 p-3 rounded-2xl border border-emerald-100">
            <div>
              <label className="block font-semibold text-emerald-950 mb-1">Target Tilawah Harian</label>
              <div className="flex items-center space-x-1">
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={tilawahSheets}
                  onChange={(e) => setTilawahSheets(parseInt(e.target.value) || 10)}
                  className="w-16 p-2 rounded-lg border border-emerald-300 font-bold text-center"
                />
                <span className="text-emerald-800 font-bold">Lembar</span>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-emerald-950 mb-1">Target Qiyamulail</label>
              <div className="flex items-center space-x-1">
                <input
                  type="number"
                  min={1}
                  max={7}
                  value={qiyamWeekly}
                  onChange={(e) => setQiyamWeekly(parseInt(e.target.value) || 2)}
                  className="w-16 p-2 rounded-lg border border-emerald-300 font-bold text-center"
                />
                <span className="text-emerald-800 font-bold">x / Pekan</span>
              </div>
            </div>
          </div>

          <div className="flex space-x-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl border border-gray-200 font-bold text-gray-600 hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold shadow-lg"
            >
              Simpan Anggota
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
