import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Bell, CreditCard, UserPlus, Info, MessageSquare, AlertTriangle, CheckCircle, Check, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../utils/cn';

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  createdAt: string;
}

interface NotificationItemProps {
  notification: Notification;
  onMarkRead: (id: string) => void;
  onCloseDropdown?: () => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({ 
  notification, 
  onMarkRead,
  onCloseDropdown 
}) => {
  const navigate = useNavigate();

  const getIcon = () => {
    switch (notification.type) {
      case 'PAYMENT':
        return <CreditCard className="w-4 h-4 text-emerald-500" />;
      case 'WAITLIST':
        return <UserPlus className="w-4 h-4 text-amber-500" />;
      case 'ANNOUNCEMENT':
        return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case 'RESULT':
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'SUBMISSION':
        return <Info className="w-4 h-4 text-indigo-500" />;
      case 'REMINDER':
        return <AlertTriangle className="w-4 h-4 text-rose-500" />;
      default:
        return <Bell className="w-4 h-4 text-slate-400" />;
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    // If it's unread, mark it as read
    if (!notification.read) {
      onMarkRead(notification._id);
    }

    // Navigate if there's a URL
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
      if (onCloseDropdown) onCloseDropdown();
    }
  };

  const handleMarkReadOnly = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMarkRead(notification._id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "group flex p-4 gap-4 border-b border-slate-50 last:border-0 cursor-pointer transition-all duration-300 relative",
        !notification.read ? "bg-blue-50/40 hover:bg-blue-50/60" : "bg-white hover:bg-slate-50"
      )}
      onClick={handleClick}
    >
      <div className={cn(
        "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-all duration-300 group-hover:scale-110",
        !notification.read ? "bg-white ring-1 ring-blue-100" : "bg-slate-50"
      )}>
        {getIcon()}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-0.5">
          <h4 className={cn(
            "text-sm font-bold truncate pr-6 transition-colors",
            notification.read ? "text-slate-500" : "text-slate-900"
          )}>
            {notification.title}
          </h4>
          <span className="text-[10px] font-medium text-slate-400 whitespace-nowrap bg-slate-50 px-1.5 py-0.5 rounded-full">
            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
          </span>
        </div>
        <p className={cn(
          "text-xs leading-relaxed line-clamp-2 transition-colors",
          notification.read ? "text-slate-400" : "text-slate-600"
        )}>
          {notification.message}
        </p>

        {notification.actionUrl && !notification.read && (
          <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-blue-600 uppercase tracking-wider group-hover:translate-x-1 transition-transform">
            View Details <ArrowRight size={10} />
          </div>
        )}
      </div>

      <div className="absolute top-1/2 -translate-y-1/2 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        {!notification.read ? (
          <button
            onClick={handleMarkReadOnly}
            className="p-2 bg-white rounded-xl shadow-lg border border-slate-100 text-slate-400 hover:text-emerald-500 hover:scale-110 transition-all"
            title="Mark as read"
          >
            <Check size={16} />
          </button>
        ) : notification.actionUrl && (
          <div className="p-2 text-slate-300">
            <ArrowRight size={16} />
          </div>
        )}
      </div>

      {!notification.read && (
        <span className="absolute left-2 top-1/2 -translate-y-1/2 w-1 h-8 rounded-full bg-blue-500" />
      )}
    </motion.div>
  );
};
