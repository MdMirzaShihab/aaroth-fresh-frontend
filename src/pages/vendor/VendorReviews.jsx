import React, { useState } from 'react';
import {
  Star,
  MessageSquare,
  Filter,
  Search,
  ThumbsUp,
  Flag,
  Send,
  TrendingUp,
  TrendingDown,
  BarChart3,
} from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';

const VendorReviews = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRating, setFilterRating] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all'); // all, responded, pending
  const [activeReview, setActiveReview] = useState(null);
  const [responseText, setResponseText] = useState('');

  // Mock data (replace with actual API calls)
  const mockReviews = [
    {
      id: 1,
      productName: 'Fresh Tomatoes',
      customerName: 'Golden Fork Buyer',
      rating: 5,
      comment: 'Excellent quality! Always fresh and delivered on time.',
      date: '2025-11-12',
      responded: true,
      response: 'Thank you for your kind words! We appreciate your business.',
      responseDate: '2025-11-12',
      helpful: 12,
    },
    {
      id: 2,
      productName: 'Organic Carrots',
      customerName: 'Spice Garden',
      rating: 4,
      comment: 'Good quality but packaging could be better.',
      date: '2025-11-10',
      responded: false,
      helpful: 8,
    },
    {
      id: 3,
      productName: 'Fresh Spinach',
      customerName: 'Ocean Blue Bistro',
      rating: 5,
      comment: 'Best spinach in town! Very fresh and clean.',
      date: '2025-11-08',
      responded: true,
      response: 'We are glad you enjoyed our spinach. Thank you!',
      responseDate: '2025-11-09',
      helpful: 15,
    },
    {
      id: 4,
      productName: 'Bell Peppers',
      customerName: 'Sunrise Cafe',
      rating: 3,
      comment: 'Average quality. Some peppers were overripe.',
      date: '2025-11-05',
      responded: false,
      helpful: 5,
    },
  ];

  const mockStats = {
    averageRating: 4.5,
    totalReviews: 248,
    ratingDistribution: [
      { stars: 5, count: 156, percentage: 63 },
      { stars: 4, count: 62, percentage: 25 },
      { stars: 3, count: 20, percentage: 8 },
      { stars: 2, count: 7, percentage: 3 },
      { stars: 1, count: 3, percentage: 1 },
    ],
    responseRate: 85,
  };

  const handleResponse = (reviewId) => {
    if (!responseText.trim()) {
      alert('Please enter a response');
      return;
    }
    // In production: Call API to submit response
    alert(`Response submitted for review #${reviewId}`);
    setActiveReview(null);
    setResponseText('');
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating
            ? 'fill-earthy-yellow text-earthy-yellow'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-8">
      {/* Header */}
      <div className="glass-layer-1 rounded-3xl p-6 shadow-soft">
        <h1 className="text-3xl font-bold text-text-dark">Reviews & Ratings</h1>
        <p className="text-text-muted mt-2">
          Manage customer feedback and build your reputation
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
        <div className="glass-layer-1 rounded-3xl p-6 shadow-soft">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-earthy-yellow/10 p-3 rounded-2xl">
              <Star className="w-6 h-6 text-earthy-yellow fill-earthy-yellow" />
            </div>
          </div>
          <p className="text-text-muted text-sm mb-1">Average Rating</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-text-dark">{mockStats.averageRating}</p>
            <p className="text-text-muted text-sm">/ 5.0</p>
          </div>
        </div>

        <div className="glass-layer-1 rounded-3xl p-6 shadow-soft">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-muted-olive/10 p-3 rounded-2xl">
              <MessageSquare className="w-6 h-6 text-muted-olive" />
            </div>
          </div>
          <p className="text-text-muted text-sm mb-1">Total Reviews</p>
          <p className="text-3xl font-bold text-text-dark">{mockStats.totalReviews}</p>
        </div>

        <div className="glass-layer-1 rounded-3xl p-6 shadow-soft">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-bottle-green/10 p-3 rounded-2xl">
              <TrendingUp className="w-6 h-6 text-bottle-green" />
            </div>
          </div>
          <p className="text-text-muted text-sm mb-1">Response Rate</p>
          <p className="text-3xl font-bold text-text-dark">{mockStats.responseRate}%</p>
        </div>

        <div className="glass-layer-1 rounded-3xl p-6 shadow-soft">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-mint-fresh/10 p-3 rounded-2xl">
              <BarChart3 className="w-6 h-6 text-mint-fresh" />
            </div>
          </div>
          <p className="text-text-muted text-sm mb-1">5-Star Reviews</p>
          <p className="text-3xl font-bold text-text-dark">
            {mockStats.ratingDistribution[0].percentage}%
          </p>
        </div>
      </div>

      {/* Rating Distribution */}
      <div className="glass-layer-1 rounded-3xl p-6 shadow-soft">
        <h2 className="text-xl font-semibold text-text-dark mb-6">Rating Distribution</h2>
        <div className="space-y-3">
          {mockStats.ratingDistribution.map((dist) => (
            <div key={dist.stars} className="flex items-center gap-4">
              <div className="flex items-center gap-1 w-20">
                {renderStars(dist.stars)}
              </div>
              <div className="flex-1">
                <div className="h-3 bg-sage-green/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-earthy-yellow to-mint-fresh rounded-full transition-all duration-500"
                    style={{ width: `${dist.percentage}%` }}
                  />
                </div>
              </div>
              <div className="w-16 text-right">
                <span className="text-sm font-medium text-text-dark">{dist.count}</span>
                <span className="text-xs text-text-muted ml-1">({dist.percentage}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="glass-layer-1 rounded-3xl p-4 shadow-soft">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reviews..."
              className="w-full pl-12 pr-4 py-3 rounded-2xl glass-layer-2 border border-sage-green/20 focus:border-muted-olive focus:ring-2 focus:ring-muted-olive/20 transition-all duration-200"
            />
          </div>

          <select
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value)}
            className="px-4 py-3 rounded-2xl glass-layer-2 border border-sage-green/20 focus:border-muted-olive focus:ring-2 focus:ring-muted-olive/20 transition-all duration-200"
          >
            <option value="all">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 rounded-2xl glass-layer-2 border border-sage-green/20 focus:border-muted-olive focus:ring-2 focus:ring-muted-olive/20 transition-all duration-200"
          >
            <option value="all">All Reviews</option>
            <option value="pending">Needs Response</option>
            <option value="responded">Responded</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {mockReviews.map((review) => (
          <div
            key={review.id}
            className="glass-layer-1 rounded-3xl p-6 shadow-soft animate-fade-in"
          >
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {renderStars(review.rating)}
                  <span className="text-sm text-text-muted">
                    {new Date(review.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <p className="font-semibold text-text-dark">{review.productName}</p>
                <p className="text-sm text-text-muted">by {review.customerName}</p>
              </div>
              <div className="flex items-center gap-2">
                {review.responded && (
                  <span className="px-3 py-1 bg-mint-fresh/20 text-bottle-green rounded-full text-sm font-medium">
                    Responded
                  </span>
                )}
                {!review.responded && (
                  <span className="px-3 py-1 bg-earthy-yellow/20 text-earthy-brown rounded-full text-sm font-medium">
                    Needs Response
                  </span>
                )}
              </div>
            </div>

            <p className="text-text-dark mb-4">{review.comment}</p>

            {review.responded && review.response && (
              <div className="glass-layer-2 rounded-2xl p-4 border-l-4 border-muted-olive mb-4">
                <p className="text-sm font-medium text-muted-olive mb-1">Your Response</p>
                <p className="text-text-dark">{review.response}</p>
                <p className="text-xs text-text-muted mt-2">
                  Responded on {new Date(review.responseDate).toLocaleDateString()}
                </p>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-sage-green/20">
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-1 text-text-muted hover:text-muted-olive transition-colors duration-200">
                  <ThumbsUp className="w-4 h-4" />
                  <span className="text-sm">{review.helpful} helpful</span>
                </button>
                <button className="flex items-center gap-1 text-text-muted hover:text-tomato-red transition-colors duration-200">
                  <Flag className="w-4 h-4" />
                  <span className="text-sm">Report</span>
                </button>
              </div>

              {!review.responded && (
                <button
                  onClick={() => setActiveReview(review.id)}
                  className="bg-gradient-primary text-white px-4 py-2 rounded-xl font-medium hover:shadow-glow-green transition-all duration-200 flex items-center gap-2 touch-target"
                >
                  <MessageSquare className="w-4 h-4" />
                  Respond
                </button>
              )}
            </div>

            {/* Response Form */}
            {activeReview === review.id && (
              <div className="mt-4 p-4 glass-layer-2 rounded-2xl animate-fade-in">
                <label className="block text-sm font-medium text-text-dark mb-2">
                  Your Response
                </label>
                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 rounded-2xl glass-layer-2 border border-sage-green/20 focus:border-muted-olive focus:ring-2 focus:ring-muted-olive/20 transition-all duration-200 resize-none mb-3"
                  placeholder="Write your response..."
                />
                <div className="flex items-center gap-2 justify-end">
                  <button
                    onClick={() => {
                      setActiveReview(null);
                      setResponseText('');
                    }}
                    className="px-4 py-2 rounded-xl text-text-muted hover:bg-sage-green/10 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleResponse(review.id)}
                    className="bg-gradient-primary text-white px-4 py-2 rounded-xl font-medium hover:shadow-glow-green transition-all duration-200 flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Send Response
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default VendorReviews;
