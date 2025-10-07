import React, { Fragment, useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import { 
  BuildingOfficeIcon,
  ChevronDownIcon,
  ArrowRightOnRectangleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const Sidebar = ({ 
  items = [], 
  userMenuItems = [], 
  user, 
  onLogout, 
  isOpen, 
  onClose, 
  title = "Dashboard",
  roleColor = "from-primary-600 to-primary-700"
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = () => {
    onLogout();
    setIsUserMenuOpen(false);
  };

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:border-r lg:border-gray-200 lg:pt-5 lg:pb-4 lg:bg-white lg:shadow-sm">
        <div className="flex items-center flex-shrink-0 px-6">
          <Link to="/" className="flex items-center space-x-2">
            <BuildingOfficeIcon className="h-8 w-8 text-primary-500" />
            <div>
              <span className="text-xl font-bold gradient-text">PropertyHub</span>
              <p className="text-xs text-gray-500 mt-0.5">{title}</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="mt-6 flex-1 px-3 space-y-1 overflow-y-auto">
          {items.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`${
                item.current
                  ? 'bg-primary-50 border-r-4 border-primary-500 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              } group flex items-center px-3 py-2 text-sm font-medium rounded-l-md transition-colors duration-150`}
            >
              <item.icon
                className={`${
                  item.current ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                } flex-shrink-0 -ml-1 mr-3 h-5 w-5`}
                aria-hidden="true"
              />
              <span className="truncate flex-1">{item.name}</span>
              {item.badge && (
                <span className={`${
                  item.current ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-600'
                } ml-auto inline-block py-0.5 px-2 text-xs rounded-full`}>
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* User section */}
        <div className="flex-shrink-0 border-t border-gray-200 p-4">
          <Menu as="div" className="relative">
            <Menu.Button className="w-full group rounded-md px-3 py-2 flex items-center text-sm text-left font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
              <div className={`flex-shrink-0 w-8 h-8 bg-gradient-to-r ${roleColor} rounded-md flex items-center justify-center`}>
                <span className="text-sm font-medium text-white">
                  {user?.firstName?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 truncate capitalize">
                  {user?.role}
                </p>
              </div>
              <ChevronDownIcon className="ml-2 flex-shrink-0 h-4 w-4 text-gray-400 group-hover:text-gray-500" />
            </Menu.Button>
            
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute bottom-full left-0 mb-1 w-full rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="py-1">
                  {userMenuItems.map((item) => (
                    <Menu.Item key={item.name}>
                      {({ active }) => (
                        <Link
                          to={item.href}
                          className={`${
                            active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                          } group flex items-center px-4 py-2 text-sm`}
                        >
                          <item.icon className="mr-3 h-4 w-4 text-gray-400 group-hover:text-gray-500" />
                          {item.name}
                        </Link>
                      )}
                    </Menu.Item>
                  ))}
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={handleLogout}
                        className={`${
                          active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                        } group flex w-full items-center px-4 py-2 text-sm text-left`}
                      >
                        <ArrowRightOnRectangleIcon className="mr-3 h-4 w-4 text-gray-400 group-hover:text-gray-500" />
                        Sign out
                      </button>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>

      {/* Mobile sidebar */}
      <div className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-300 ease-in-out`}>
        <div className="flex items-center justify-between flex-shrink-0 px-4 py-4 border-b border-gray-200">
          <Link to="/" className="flex items-center space-x-2">
            <BuildingOfficeIcon className="h-8 w-8 text-primary-500" />
            <div>
              <span className="text-xl font-bold gradient-text">PropertyHub</span>
              <p className="text-xs text-gray-500 mt-0.5">{title}</p>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <span className="sr-only">Close sidebar</span>
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Mobile navigation */}
        <nav className="mt-4 flex-1 px-3 space-y-1 overflow-y-auto">
          {items.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              onClick={onClose}
              className={`${
                item.current
                  ? 'bg-primary-50 border-r-4 border-primary-500 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              } group flex items-center px-3 py-2 text-sm font-medium rounded-l-md transition-colors duration-150`}
            >
              <item.icon
                className={`${
                  item.current ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                } flex-shrink-0 -ml-1 mr-3 h-5 w-5`}
              />
              <span className="truncate flex-1">{item.name}</span>
              {item.badge && (
                <span className={`${
                  item.current ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-600'
                } ml-auto inline-block py-0.5 px-2 text-xs rounded-full`}>
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* Mobile user section */}
        <div className="flex-shrink-0 border-t border-gray-200 p-4">
          <div className="flex items-center mb-4">
            <div className={`flex-shrink-0 w-10 h-10 bg-gradient-to-r ${roleColor} rounded-full flex items-center justify-center`}>
              <span className="text-sm font-medium text-white">
                {user?.firstName?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {user?.role}
              </p>
            </div>
          </div>
          
          <div className="space-y-1">
            {userMenuItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={onClose}
                className="group flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-md"
              >
                <item.icon className="mr-3 h-4 w-4 text-gray-400 group-hover:text-gray-500" />
                {item.name}
              </Link>
            ))}
            <button
              onClick={() => {
                handleLogout();
                onClose();
              }}
              className="group flex w-full items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-md text-left"
            >
              <ArrowRightOnRectangleIcon className="mr-3 h-4 w-4 text-gray-400 group-hover:text-gray-500" />
              Sign out
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;