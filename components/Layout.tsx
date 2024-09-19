"use client"

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, Upload, LogOut, ChevronRight, Pin, PinOff } from 'lucide-react';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const [isPinned, setIsPinned] = useState(false);
 
  const handleMouseEnter = () => {
    if (!isPinned) {
      setIsOpen(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isPinned) {
      setIsOpen(false);
      setIsOpen(false);
      setHoveredItem(null);
    }
  };

  const handleTogglePin = () => {
    setIsPinned(!isPinned);
    setIsOpen(!isPinned);
  }
 

  const handleLogout = () => {
    // Implement logout logic here
    localStorage.removeItem('user');
    router.push('/login');
  };

  useEffect(() => {
    const sidebar = sidebarRef.current;
    if (sidebar) {
      sidebar.addEventListener('mouseenter', handleMouseEnter);
      sidebar.addEventListener('mouseleave', handleMouseLeave);

      return () => {
        sidebar.removeEventListener('mouseenter', handleMouseEnter);
        sidebar.removeEventListener('mouseleave', handleMouseLeave);
      };
    }
  }, [isPinned]);

  const verticalWaveVariants = {
    initial: { pathLength: 0, opacity: 0 },
    animate: { pathLength: 1, opacity: 1, transition: { duration: 0.5 } },
    exit: { pathLength: 0, opacity: 0, transition: { duration: 0.3 } },
  };

  const horizontalWaveVariants = {
    initial: { pathLength: 0, opacity: 0 },
    animate: { pathLength: 1, opacity: 1, transition: { duration: 0.5 } },
    exit: { pathLength: 0, opacity: 0, transition: { duration: 0.3 } },
  };

  const NavItem = ({ href, icon: Icon, label }: { href: string; icon: React.ElementType; label: string }) => (
    <li
      onMouseEnter={() => setHoveredItem(label)}
      onMouseLeave={() => setHoveredItem(null)}
      className="relative"
    >
      <Link href={href} className={`flex items-center p-4 hover:bg-gray-100 ${pathname === href ? 'bg-gray-100' : ''}`}>
        <Icon size={24} className="text-gray-600" />
        <motion.span
          className="ml-4 text-gray-700 whitespace-nowrap"
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: isOpen ? 1 : 0, width: isOpen ? 'auto' : 0 }}
          transition={{ duration: 0.2 }}
        >
          {label}
        </motion.span>
      </Link>
      {hoveredItem === label && (
        <motion.svg
          className="absolute left-0 top-0 h-full pointer-events-none"
          initial="initial"
          animate="animate"
          exit="exit"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <motion.path
            d="M50,0 Q45,25 50,50 T50,100"
            fill="none"
            stroke="rgba(59, 130, 246, 0.5)"
            strokeWidth="4"
            variants={verticalWaveVariants}
          />
        </motion.svg>
      )}
    </li>
  );

  return (
    
    <div className="flex h-screen bg-[#f9fafb]">
      <motion.div
        ref={sidebarRef}
        className="bg-white shadow-lg z-10"
        initial={{ width: '64px' }}
        animate={{ width: isOpen ? '240px' : '64px' }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4">
            <button onClick={handleTogglePin} className="text-gray-400 hover:text-gray-600">
              {isPinned ? <PinOff size={20} /> : <Pin size={20} />}
            </button>
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronRight size={24} className="text-gray-400" />
            </motion.div>
          </div>
          <nav className="flex-grow">
            <ul className="space-y-2">
              <NavItem href="/" icon={Home} label="Home" />
              <NavItem href="/upload" icon={Upload} label="Upload" />
            </ul>
          </nav>
          <div className="p-4">
            <button
              onClick={handleLogout}
              className="flex items-center text-gray-600 hover:text-red-600 w-full relative"
              onMouseEnter={() => setHoveredItem('Logout')}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <LogOut size={24} />
              <motion.span
                className="ml-4 whitespace-nowrap"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: isOpen ? 1 : 0, width: isOpen ? 'auto' : 0 }}
                transition={{ duration: 0.2 }}
              >
                Logout
              </motion.span>
              {hoveredItem === 'Logout' && (
                <motion.svg
                  className="absolute left-0 top-0 w-full h-full pointer-events-none"
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                >
                  <motion.path
                    d="M0,50 Q25,45 50,50 T100,50"
                    fill="none"
                    stroke="rgba(239, 68, 68, 0.5)"
                    strokeWidth="4"
                    variants={horizontalWaveVariants}
                  />
                </motion.svg>
              )}
            </button>
          </div>
        </div>
      </motion.div>
      <div className="flex-grow overflow-auto p-8">{children}</div>
    </div>
  );
};

export default Layout;