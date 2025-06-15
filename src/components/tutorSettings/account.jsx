import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User } from 'lucide-react';

const AccountSection = ({ form, handleChange, getFieldErrorClasses }) => {
  const nameError = getFieldErrorClasses('name');
  const emailError = getFieldErrorClasses('email');
  const phoneError = getFieldErrorClasses('phone');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5 text-primary" /> Account & Security
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="name" className={nameError.label}>Name *</Label>
          <Input id="name" value={form.name} onChange={handleChange} className={nameError.input} />
        </div>
        <div>
          <Label htmlFor="email" className={emailError.label}>Email *</Label>
          <Input id="email" value={form.email} onChange={handleChange} className={emailError.input} />
        </div>
        <div>
          <Label htmlFor="phone" className={phoneError.label}>Phone *</Label>
          <Input id="phone" value={form.phone} onChange={handleChange} className={phoneError.input} />
        </div>
        <div>
          <Label htmlFor="password">Password *</Label>
          <Input id="password" value={form.password} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="confirmPassword">Confirm Password *</Label>
          <Input id="confirmPassword" value={form.confirmPassword} onChange={handleChange} />
        </div>
      </CardContent>
    </Card>
  );
};

export default AccountSection;