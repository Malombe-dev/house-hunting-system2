import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  MagnifyingGlassIcon,
  HomeIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  WrenchScrewdriverIcon,
  UserGroupIcon,
  ArrowRightIcon,
  StarIcon
} from '@heroicons/react/24/outline';

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [location, setLocation] = useState('');
  
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    const searchParams = new URLSearchParams();
    
    if (searchQuery) searchParams.append('q', searchQuery);
    if (propertyType) searchParams.append('type', propertyType);
    if (location) searchParams.append('location', location);
    
    navigate(`/properties?${searchParams.toString()}`);
  };

  const features = [
    {
      icon: HomeIcon,
      title: 'Property Listings',
      description: 'Browse thousands of verified property listings with detailed information and high-quality photos.'
    },
    {
      icon: CurrencyDollarIcon,
      title: 'Secure Payments',
      description: 'Handle rent payments, deposits, and fees securely through our integrated payment system.'
    },
    {
      icon: WrenchScrewdriverIcon,
      title: 'Maintenance Management',
      description: 'Submit and track maintenance requests with real-time updates and professional service providers.'
    },
    {
      icon: ChartBarIcon,
      title: 'Analytics & Reports',
      description: 'Get detailed insights into your property performance, income, and market trends.'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Secure & Reliable',
      description: 'Your data is protected with enterprise-grade security and 99.9% uptime guarantee.'
    },
    {
      icon: UserGroupIcon,
      title: '24/7 Support',
      description: 'Our dedicated support team is available around the clock to help with any questions.'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Property Owner',
      image: '/api/placeholder/64/64',
      rating: 5,
      text: 'PropertyHub has revolutionized how I manage my rental properties. The automated rent collection and maintenance tracking have saved me countless hours.'
    },
    {
      name: 'Michael Chen',
      role: 'Tenant',
      image: '/api/placeholder/64/64',
      rating: 5,
      text: 'Finding my perfect apartment was so easy with PropertyHub. The search filters and detailed property information made the decision simple.'
    },
    {
      name: 'Grace Wanjiku',
      role: 'Property Agent',
      image: '/api/placeholder/64/64',
      rating: 5,
      text: 'As a property agent, this platform has streamlined my workflow. Managing multiple properties and tenants has never been this efficient.'
    }
  ];

  const stats = [
    { value: '10K+', label: 'Properties Listed' },
    { value: '25K+', label: 'Happy Users' },
    { value: '500+', label: 'Property Agents' },
    { value: '99.9%', label: 'Uptime' }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white">
        <div className="container-base">
          <div className="py-20 lg:py-24">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Content */}
              <div className="space-y-8">
                <div className="space-y-4">
                  <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                    Find Your Perfect{' '}
                    <span className="text-primary-200">Home</span>{' '}
                    Today
                  </h1>
                  <p className="text-xl text-primary-100 leading-relaxed">
                    Discover thousands of properties, manage rentals efficiently, and connect with trusted agents in Kenya's leading property platform.
                  </p>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  {!isAuthenticated ? (
                    <>
                      <Link
                        to="/auth/register"
                        className="btn-secondary text-primary-700 hover:text-primary-800 bg-white hover:bg-gray-50"
                      >
                        Get Started Free
                      </Link>
                      <Link
                        to="/properties"
                        className="flex items-center justify-center space-x-2 px-6 py-3 border-2 border-primary-200 text-primary-100 hover:bg-primary-600 rounded-lg font-medium transition-colors"
                      >
                        <span>Browse Properties</span>
                        <ArrowRightIcon className="h-4 w-4" />
                      </Link>
                    </>
                  ) : (
                    <Link
                      to={user?.role === 'seeker' ? '/properties' : `/${user.role}/dashboard`}
                      className="btn-secondary text-primary-700 hover:text-primary-800 bg-white hover:bg-gray-50"
                    >
                      {user?.role === 'seeker' ? 'Browse Properties' : 'Go to Dashboard'}
                    </Link>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-8">
                  {stats.map((stat, index) => (
                    <div key={index} className="text-center">
                      <div className="text-2xl lg:text-3xl font-bold text-white">
                        {stat.value}
                      </div>
                      <div className="text-sm text-primary-200">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Search Form */}
              <div className="bg-white rounded-2xl shadow-2xl p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  Find Your Next Home
                </h3>
                
                <form onSubmit={handleSearch} className="space-y-4">
                  {/* Search Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      What are you looking for?
                    </label>
                    <div className="relative">
                      <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Enter keywords, location, or property type"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Property Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Property Type
                    </label>
                    <select
                      value={propertyType}
                      onChange={(e) => setPropertyType(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">All Types</option>
                      <option value="apartment">Apartment</option>
                      <option value="house">House</option>
                      <option value="studio">Studio</option>
                      <option value="commercial">Commercial</option>
                    </select>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <select
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">All Locations</option>
                      <option value="nairobi">Nairobi</option>
                      <option value="mombasa">Mombasa</option>
                      <option value="kisumu">Kisumu</option>
                      <option value="nakuru">Nakuru</option>
                      <option value="eldoret">Eldoret</option>
                    </select>
                  </div>

                  {/* Search Button */}
                  <button
                    type="submit"
                    className="w-full btn-primary"
                  >
                    Search Properties
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container-base">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need in One Platform
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From finding your dream home to managing properties efficiently, we provide all the tools you need for a seamless experience.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className="p-3 bg-primary-100 rounded-lg">
                    <feature.icon className="h-6 w-6 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="container-base">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Getting started with PropertyHub is simple. Follow these easy steps to find or manage your properties.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-primary-600">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Create Your Account
              </h3>
              <p className="text-gray-600">
                Sign up for free and choose your role - whether you're looking for a home, managing properties, or offering rental services.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-primary-600">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Browse or List Properties
              </h3>
              <p className="text-gray-600">
                Search for your perfect home using our advanced filters or list your properties to reach thousands of potential tenants.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-primary-600">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Manage Everything Online
              </h3>
              <p className="text-gray-600">
                Handle applications, payments, maintenance requests, and communications all through our intuitive dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="container-base">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Don't just take our word for it. Here's what property owners, tenants, and agents have to say about PropertyHub.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-xl shadow-sm border border-gray-100"
              >
                {/* Stars */}
                <div className="flex space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>

                {/* Testimonial Text */}
                <p className="text-gray-600 mb-6 leading-relaxed">
                  "{testimonial.text}"
                </p>

                {/* Author */}
                <div className="flex items-center space-x-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-700">
        <div className="container-base">
          <div className="text-center text-white">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
              Join thousands of users who trust PropertyHub for their property management needs.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!isAuthenticated ? (
                <>
                  <Link
                    to="/auth/register"
                    className="btn-secondary bg-white text-primary-600 hover:bg-gray-50"
                  >
                    Start Free Trial
                  </Link>
                  <Link
                    to="/properties"
                    className="flex items-center justify-center space-x-2 px-6 py-3 border-2 border-white text-white hover:bg-white hover:text-primary-600 rounded-lg font-medium transition-colors"
                  >
                    <span>Browse Properties</span>
                    <ArrowRightIcon className="h-4 w-4" />
                  </Link>
                </>
              ) : (
                <Link
                  to={user?.role === 'seeker' ? '/properties' : `/${user.role}/dashboard`}
                  className="btn-secondary bg-white text-primary-600 hover:bg-gray-50"
                >
                  {user?.role === 'seeker' ? 'Find Properties' : 'Go to Dashboard'}
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;