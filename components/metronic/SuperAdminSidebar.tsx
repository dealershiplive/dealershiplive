import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  active: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ href, icon, title, active }) => {
  return (
    <Link href={href} className={`flex items-center px-4 py-3 rounded-lg mb-1 transition-colors ${
      active 
        ? 'bg-primary text-white' 
        : 'text-gray-700 hover:bg-gray-100'
    }`}>
      <span className="mr-3">{icon}</span>
      <span className="font-medium">{title}</span>
    </Link>
  );
};

export default function SuperAdminSidebar() {
  const router = useRouter();
  const currentPath = router.pathname;

  const isActive = (path: string) => {
    return currentPath === path || currentPath.startsWith(`${path}/`);
  };

  return (
    <div className="w-64 bg-white shadow-md rounded-lg p-4">
      <div className="mb-6 px-4">
        <h2 className="text-xl font-bold text-gray-800">Super Admin</h2>
        <p className="text-sm text-gray-500">Platform Management</p>
      </div>
      
      <div className="space-y-1">
        <NavItem 
          href="/super-admin/dashboard" 
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          } 
          title="Dashboard" 
          active={isActive('/super-admin/dashboard')} 
        />
        
        <NavItem 
          href="/super-admin/clients" 
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          } 
          title="Clients" 
          active={isActive('/super-admin/clients')} 
        />
        
        <NavItem 
          href="/super-admin/subscriptions" 
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          } 
          title="Subscriptions" 
          active={isActive('/super-admin/subscriptions')} 
        />
        
        <NavItem 
          href="/super-admin/analytics" 
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          } 
          title="Analytics" 
          active={isActive('/super-admin/analytics')} 
        />
        
        <NavItem 
          href="/super-admin/settings" 
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          } 
          title="Settings" 
          active={isActive('/super-admin/settings')} 
        />
        
        <NavItem 
          href="/super-admin/support" 
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          } 
          title="Support" 
          active={isActive('/super-admin/support')} 
        />
      </div>
    </div>
  );
} 