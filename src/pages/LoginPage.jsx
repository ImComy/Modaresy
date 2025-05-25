import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';
import { FaGoogle, FaFacebookF } from "react-icons/fa";

const LoginPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const buttonClasses =
    "w-full py-2 rounded-lg mb-3 font-semibold text-white transition-colors duration-300 hover:brightness-110";

  const { t } = useTranslation();
  const isRTL = i18next.dir() === 'rtl';

  const handleLogin = (e) => {
    e.preventDefault();
    // Add actual login logic here (e.g., API call)
    console.log('Login attempt');
    // For now, simulate success and redirect
    toast({
      title: "Login Successful",
      description: "Welcome back!",
    });
    // In a real app, you'd set the logged-in state here
    // For Navbar demo, trigger the state change there or use context
    navigate('/');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex items-center justify-center py-12"
    >
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Login</CardTitle>
          <CardDescription>Access your TutorConnect account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="m@example.com" required />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link to="/forgot-password" // Add forgot password page later
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input id="password" type="password" required />
            </div>
            <Button type="submit" className="w-full">Login</Button>
          </form>
          {/* Optional: Add social login buttons later */}
          {/* <div className="mt-4 text-center text-sm text-muted-foreground">
            Or login with
          </div> */}
        </CardContent>
        <CardFooter className="flex justify-center text-sm">
          <p className="text-muted-foreground">
            Don't have an account?&nbsp;
            <Link to="/signup" className="text-primary hover:underline font-medium">
              Sign Up
            </Link>
          </p>
        </CardFooter>
        <div className="flex flex-col px-6 mb-4">
          <div className="flex items-center my-6">
            <hr className="flex-grow border-t border-gray-300 dark:border-gray-600" />
            <span className="mx-3 text-gray-500 dark:text-gray-400 font-semibold select-none">
              {t("or")}
            </span>
            <hr className="flex-grow border-t border-gray-300 dark:border-gray-600" />
          </div>
          <button
            onClick={() => alert(t("Sign Up with Google clicked"))}
            className={`${buttonClasses} bg-red-500 flex items-center justify-center gap-2`}
          >
            <FaGoogle />{t("Sign Up with Google")}
          </button>
          <button
            onClick={() => alert(t("Sign Up with Facebook clicked"))}
            className={`${buttonClasses} bg-[#1877F2] flex items-center justify-center gap-2`}
          >
            <FaFacebookF /> {t("Sign Up with Facebook")}
          </button>
        </div>
      </Card>
    </motion.div>
  );
};

export default LoginPage;
