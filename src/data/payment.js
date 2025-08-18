import {
  Wallet,
  Smartphone,
  Landmark,
  CreditCard,
  Percent,
  BadgeCheck,
  Gift
} from 'lucide-react';

export const getPaymentIcon = (method) => {
  if (!method) return Wallet;
  
  const lowerMethod = method.toLowerCase();

  if (lowerMethod.includes('cash') || lowerMethod.includes('fawry')) {
    return Wallet;
  } else if (lowerMethod.includes('vodafone') || 
             lowerMethod.includes('etisalat') || 
             lowerMethod.includes('orange') ||
             lowerMethod.includes('mobile')) {
    return Smartphone;
  } else if (lowerMethod.includes('bank') || 
             lowerMethod.includes('transfer')) {
    return Landmark;
  } else if (lowerMethod.includes('credit') || 
             lowerMethod.includes('card') || 
             lowerMethod.includes('meeza') || 
             lowerMethod.includes('instapay') || 
             lowerMethod.includes('valu')) {
    return CreditCard;
  } else if (lowerMethod.includes('discount') || 
             lowerMethod.includes('offer')) {
    return Percent;
  } else if (lowerMethod.includes('voucher') || 
             lowerMethod.includes('coupon')) {
    return Gift;
  } else if (lowerMethod.includes('certified') || 
             lowerMethod.includes('verified')) {
    return BadgeCheck;
  } else {
    return Wallet; 
  }
};