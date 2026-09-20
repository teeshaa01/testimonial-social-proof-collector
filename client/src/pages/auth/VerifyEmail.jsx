import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../api/auth.api';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { CheckCircle2, AlertCircle, Loader2, Mail, ArrowRight } from 'lucide-react';

export const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState('verifying'); // verifying, success, error, resend
  const [message, setMessage] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [simulatedLink, setSimulatedLink] = useState('');

  const { refreshUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setStatus('resend');
      return;
    }

    const verify = async () => {
      try {
        const res = await authApi.verifyEmail(token);
        setStatus('success');
        setMessage(res.data.message || 'Email verified successfully!');
        refreshUser();
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Verification link is invalid or expired.');
      }
    };

    verify();
  }, [token]);

  const handleResend = async (e) => {
    e.preventDefault();
    if (!resendEmail) return;

    setIsResending(true);
    try {
      const res = await authApi.resendVerification(resendEmail);
      setMessage(res.data.message || 'Verification simulated!');
      if (res.data.emailPreview?.link) {
        setSimulatedLink(res.data.emailPreview.link);
      }
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to resend verification.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Card className="shadow-lg border-slate-200">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-2 shadow-inner">
              <Mail className="w-6 h-6" />
            </div>
            <CardTitle className="text-2xl font-bold">Email Verification</CardTitle>
            <CardDescription>
              Technical assessment verification simulation workflow
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            {status === 'verifying' && (
              <div className="py-8 flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                <p className="text-sm text-slate-600 font-medium">Verifying your token...</p>
              </div>
            )}

            {status === 'success' && (
              <div className="py-6 space-y-4">
                <div className="mx-auto w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="text-lg font-bold text-slate-900">Email Verified!</h4>
                <p className="text-sm text-slate-600">{message}</p>
                <Button
                  variant="default"
                  className="w-full mt-4"
                  onClick={() => navigate('/dashboard')}
                >
                  <span>Go to My Spaces</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            )}

            {(status === 'error' || status === 'resend') && (
              <div className="py-4 space-y-4 text-left">
                {status === 'error' && (
                  <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{message}</span>
                  </div>
                )}

                <p className="text-xs text-slate-600">
                  Need a new verification link? Enter your email address below to simulate a new verification request:
                </p>

                <form onSubmit={handleResend} className="space-y-3">
                  <Input
                    label="Account Email"
                    type="email"
                    placeholder="owner@company.com"
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    required
                  />
                  <Button
                    type="submit"
                    variant="default"
                    className="w-full"
                    isLoading={isResending}
                  >
                    Resend Simulated Verification
                  </Button>
                </form>

                {simulatedLink && (
                  <div className="mt-4 p-3 rounded-lg bg-indigo-50 border border-indigo-200">
                    <p className="text-xs font-semibold text-indigo-900 mb-1">
                      Simulated Link Generated:
                    </p>
                    <a
                      href={simulatedLink}
                      className="text-xs text-indigo-600 break-all hover:underline"
                    >
                      {simulatedLink}
                    </a>
                  </div>
                )}

                <div className="text-center pt-2">
                  <Link to="/login" className="text-xs text-indigo-600 font-semibold hover:underline">
                    Back to login
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
