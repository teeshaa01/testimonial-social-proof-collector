import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../../api/auth.api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { KeyRound, ArrowLeft, Mail, ExternalLink } from 'lucide-react';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [simulatedLink, setSimulatedLink] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setErrorMsg('');

    if (!email) {
      setErrorMsg('Please enter your email.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authApi.forgotPassword(email);
      setMessage(res.data.message || 'Password reset link sent!');
      if (res.data.emailPreview?.link) {
        setSimulatedLink(res.data.emailPreview.link);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error requesting password reset.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Card className="shadow-lg border-slate-200">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-2 shadow-inner">
              <KeyRound className="w-6 h-6" />
            </div>
            <CardTitle className="text-2xl font-bold">Forgot Password?</CardTitle>
            <CardDescription>
              Enter your email to receive a simulated password reset link.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {errorMsg && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm">
                {errorMsg}
              </div>
            )}

            {message && (
              <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm">
                {message}
              </div>
            )}

            {simulatedLink ? (
              <div className="space-y-4 p-4 rounded-xl bg-indigo-50 border border-indigo-200">
                <div className="flex items-center gap-2 text-indigo-900 font-semibold text-xs uppercase tracking-wider">
                  <Mail className="w-4 h-4 text-indigo-600" />
                  Simulated Reset Email
                </div>
                <p className="text-xs text-indigo-800">
                  Password reset token was generated. Click the simulated link below or inspect the server logs:
                </p>
                <a
                  href={simulatedLink}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 break-all bg-white p-2.5 rounded-lg border border-indigo-200 shadow-sm"
                >
                  <ExternalLink className="w-4 h-4 shrink-0" />
                  <span>Open Reset Password Screen</span>
                </a>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Registered Email"
                  type="email"
                  placeholder="owner@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                <Button
                  type="submit"
                  variant="default"
                  size="lg"
                  className="w-full mt-2"
                  isLoading={isLoading}
                >
                  Send Reset Link
                </Button>
              </form>
            )}

            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-indigo-600 font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to log in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
