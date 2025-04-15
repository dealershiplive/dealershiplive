import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/login');
      return;
    }

    // Redirect based on role
    const user = JSON.parse(storedUser);
    switch (user.role) {
      case 'SUPER_ADMIN':
        router.push('/super-admin/dashboard');
        break;
      case 'ADMIN':
        router.push('/admin/dashboard');
        break;
      case 'AGENT':
        router.push('/agent/dashboard');
        break;
      default:
        router.push('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      Redirecting...
    </div>
  );
} 