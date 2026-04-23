import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Bell, Check, MoreHorizontal, Inbox, Filter, ListFilter, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { isToday, isYesterday, parseISO } from 'date-fns';
import { useNotifications } from '../../context/NotificationContext';
import { NotificationItem } from './NotificationItem';
import { Button } from '../ui/Button';
import { cn } from '../../utils/cn';

type FilterType = 'all' | 'unread';

export const NotificationBell: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, loading } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredNotifications = useMemo(() => {
    if (activeFilter === 'unread') {
      return notifications.filter(n => !n.read);
    }
    return notifications;
  }, [notifications, activeFilter]);

  const groupedNotifications = useMemo(() => {
    const groups: { [key: string]: typeof notifications } = {
      Today: [],
      Yesterday: [],
      Earlier: []
    };

    filteredNotifications.forEach(notification => {
      const date = parseISO(notification.createdAt);
      if (isToday(date)) {
        groups.Today.push(notification);
      } else if (isYesterday(date)) {
        groups.Yesterday.push(notification);
      } else {
        groups.Earlier.push(notification);
      }
    });

    return Object.entries(groups).filter(([_, items]) => items.length > 0);
  }, [filteredNotifications]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-2xl hover:bg-slate-100 transition-all duration-300 group active:scale-95"
      >
        <Bell className={cn(
          "w-5 h-5 transition-colors duration-300",
          isOpen ? "text-primary" : "text-secondary group-hover:text-primary"
        )} />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0, bounce: 0.5 }}
            animate={{ scale: 1 }}
            className="absolute top-1.5 right-1.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-black text-white ring-2 ring-white shadow-sm"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: 15, scale: 0.95, filter: 'blur(10px)' }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="absolute right-0 mt-3 w-80 sm:w-[420px] bg-white/95 backdrop-blur-xl rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-200/60 z-[100] overflow-hidden"
          >
            {/* Header */}
            <div className="p-5 border-b border-slate-100/60 bg-white/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Notifications</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[11px] font-bold text-primary hover:text-blue-700 transition-colors uppercase tracking-widest flex items-center gap-1"
                  >
                    <CheckCircle2 size={13} />
                    Mark all read
                  </button>
                )}
              </div>

              {/* Tabs */}
              <div className="flex p-1 bg-slate-100/80 rounded-xl w-fit">
                <button
                  onClick={() => setActiveFilter('all')}
                  className={cn(
                    "px-4 py-1.5 text-xs font-bold rounded-lg transition-all duration-200",
                    activeFilter === 'all' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  All
                </button>
                <button
                  onClick={() => setActiveFilter('unread')}
                  className={cn(
                    "px-4 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 flex items-center gap-1.5",
                    activeFilter === 'unread' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  Unread
                  {unreadCount > 0 && (
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                  )}
                </button>
              </div>
            </div>

            {/* List */}
            <div className="max-h-[500px] overflow-y-auto custom-scrollbar bg-white/30">
              {loading && notifications.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-sm font-medium text-slate-500">Syncing updates...</p>
                </div>
              ) : groupedNotifications.length > 0 ? (
                <div className="pb-4">
                  {groupedNotifications.map(([groupName, items]) => (
                    <div key={groupName} className="mt-4 first:mt-2">
                      <div className="px-5 mb-2">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                          {groupName}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        {items.map((notification) => (
                          <NotificationItem
                            key={notification._id}
                            notification={notification}
                            onMarkRead={markAsRead}
                            onCloseDropdown={() => setIsOpen(false)}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-16 text-center">
                  <div className="w-20 h-20 bg-slate-50 rounded-[32px] flex items-center justify-center mx-auto mb-6 transform -rotate-6 shadow-sm">
                    <Inbox className="w-10 h-10 text-slate-200" />
                  </div>
                  <h4 className="text-slate-900 font-black text-lg mb-1 tracking-tight">All Caught Up!</h4>
                  <p className="text-sm text-slate-400 max-w-[200px] mx-auto leading-relaxed">
                    {activeFilter === 'unread' 
                      ? "You've read all your recent notifications."
                      : "We'll let you know when something important happens."}
                  </p>
                </div>
              )}
            </div>

            {notifications.length > 0 && (
              <button className="w-full p-4 text-xs font-black text-slate-500 hover:text-primary transition-all bg-slate-50/50 border-t border-slate-100 flex items-center justify-center gap-2 group">
                <ListFilter size={14} className="group-hover:rotate-180 transition-transform duration-500" />
                View Full Activity Log
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
