import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, Button, Input } from '../../components/ui';
import { Snowflake, LogIn } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

export function Login() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const { error } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await signIn(email, password);

    if (result.error) {
      error('Login failed', result.error);
      setIsLoading(false);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-xl bg-action mb-4">
            <Snowflake className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-display font-bold text-white">MFO Ice Tech</h1>
          <p className="text-wolf-400 mt-2">Ice Management System</p>
        </div>

        {/* Login form */}
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@facility.com"
                required
              />
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />

              <Button
                type="submit"
                className="w-full"
                isLoading={isLoading}
                leftIcon={<LogIn className="h-4 w-4" />}
              >
                Sign In
              </Button>
            </form>

            {/* Demo mode notice */}
            <div className="mt-6 pt-6 border-t border-wolf-200">
              <p className="text-sm text-wolf-600 text-center">
                <strong>Demo Mode:</strong> Enter any email and password to access the application.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-wolf-500 text-sm mt-8">
          Max Facility Operations &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
