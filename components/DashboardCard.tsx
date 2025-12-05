'use client';

import { motion } from 'framer-motion';
import { ReactNode, memo } from 'react';

interface DashboardCardProps {
  title: string | ReactNode;
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
}

function DashboardCard({ title, children, className = '', icon }: DashboardCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6 ${className}`}
    >
      <div className="flex items-center gap-3 mb-4">
        {icon && (
          <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
            {icon}
          </div>
        )}
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>
      {children}
    </motion.div>
  );
}

export default memo(DashboardCard); 