import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  TrendingUp,
  Target,
  CheckCircle,
  AlertTriangle,
  Info,
  Lightbulb,
  BarChart3,
  ExternalLink,
} from 'lucide-react';
import { Card } from '../ui/Card';
import Button from '../ui/Button';
import LoadingSpinner from '../ui/LoadingSpinner';
import { useOptimizeListingSEOMutation } from '../../store/slices/vendor/vendorListingsApi';

const SEOOptimizationPanel = ({ listingId, listing, className = '' }) => {
  const [seoData, setSeoData] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const [optimizeListingSEO, { isLoading }] = useOptimizeListingSEOMutation();

  const handleOptimizeSEO = async () => {
    try {
      const result = await optimizeListingSEO(listingId).unwrap();
      setSeoData(result);
      setIsExpanded(true);
    } catch (error) {
      // Error will be handled by the mutation hook
    }
  };

  const getSEOScoreColor = (score) => {
    if (score >= 90) return 'text-sage-green';
    if (score >= 70) return 'text-earthy-yellow';
    if (score >= 50) return 'text-orange-500';
    return 'text-tomato-red';
  };

  const getSEOScoreBg = (score) => {
    if (score >= 90) return 'bg-sage-green/10 border-sage-green/20';
    if (score >= 70) return 'bg-earthy-yellow/10 border-earthy-yellow/20';
    if (score >= 50) return 'bg-orange-500/10 border-orange-500/20';
    return 'bg-tomato-red/10 border-tomato-red/20';
  };

  const currentSEO = listing?.seoMetadata || {};
  const hasBasicSEO = currentSEO.metaTitle && currentSEO.metaDescription;

  return (
    <Card className={`glass ${className}`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-muted-olive/10">
              <Search className="w-5 h-5 text-muted-olive" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-text-dark">
                SEO Optimization
              </h3>
              <p className="text-sm text-text-muted">
                Improve search visibility and ranking
              </p>
            </div>
          </div>
          
          <Button
            onClick={handleOptimizeSEO}
            disabled={isLoading}
            className="bg-muted-olive hover:bg-muted-olive/90 text-white flex items-center gap-2"
            size="sm"
          >
            {isLoading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <Lightbulb className="w-4 h-4" />
            )}
            {isLoading ? 'Analyzing...' : 'Get Suggestions'}
          </Button>
        </div>

        {/* Current SEO Status */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5">
              <div className={`p-2 rounded-full ${hasBasicSEO ? 'bg-sage-green/10' : 'bg-tomato-red/10'}`}>
                {hasBasicSEO ? (
                  <CheckCircle className={`w-4 h-4 text-sage-green`} />
                ) : (
                  <AlertTriangle className={`w-4 h-4 text-tomato-red`} />
                )}
              </div>
              <div>
                <div className="text-sm font-medium text-text-dark">
                  Basic SEO
                </div>
                <div className="text-xs text-text-muted">
                  {hasBasicSEO ? 'Complete' : 'Missing meta tags'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5">
              <div className="p-2 rounded-full bg-earthy-yellow/10">
                <Target className="w-4 h-4 text-earthy-yellow" />
              </div>
              <div>
                <div className="text-sm font-medium text-text-dark">
                  Keywords
                </div>
                <div className="text-xs text-text-muted">
                  {currentSEO.keywords?.length || 0} keywords
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5">
              <div className="p-2 rounded-full bg-muted-olive/10">
                <BarChart3 className="w-4 h-4 text-muted-olive" />
              </div>
              <div>
                <div className="text-sm font-medium text-text-dark">
                  Performance
                </div>
                <div className="text-xs text-text-muted">
                  {listing?.performance?.searchRanking ? `Rank #${listing.performance.searchRanking}` : 'Not tracked'}
                </div>
              </div>
            </div>
          </div>

          {/* Current Meta Information */}
          {hasBasicSEO && (
            <div className="space-y-3 p-4 rounded-2xl bg-white/5 border border-white/10">
              <h4 className="text-sm font-medium text-text-dark flex items-center gap-2">
                <Info className="w-4 h-4" />
                Current SEO Settings
              </h4>
              
              <div className="space-y-2">
                <div>
                  <span className="text-xs text-text-muted">Meta Title:</span>
                  <p className="text-sm text-text-dark mt-1 truncate">
                    {currentSEO.metaTitle || listing?.title}
                  </p>
                </div>
                
                <div>
                  <span className="text-xs text-text-muted">Meta Description:</span>
                  <p className="text-sm text-text-dark mt-1 line-clamp-2">
                    {currentSEO.metaDescription || listing?.description?.substring(0, 150)}
                  </p>
                </div>
                
                {currentSEO.keywords?.length > 0 && (
                  <div>
                    <span className="text-xs text-text-muted">Keywords:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {currentSEO.keywords.map((keyword, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs bg-muted-olive/10 text-muted-olive rounded-lg"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* SEO Optimization Results */}
        {seoData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 space-y-4"
          >
            {/* SEO Score */}
            <div className={`p-4 rounded-2xl border ${getSEOScoreBg(seoData.optimizedScore)}`}>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-text-dark">SEO Score Analysis</h4>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-xs text-text-muted">Current</div>
                    <div className={`text-lg font-bold ${getSEOScoreColor(seoData.currentSeo.score)}`}>
                      {seoData.currentSeo.score}
                    </div>
                  </div>
                  <div className="text-text-muted">→</div>
                  <div className="text-right">
                    <div className="text-xs text-text-muted">Potential</div>
                    <div className={`text-lg font-bold ${getSEOScoreColor(seoData.optimizedScore)}`}>
                      {seoData.optimizedScore}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className={`w-4 h-4 ${getSEOScoreColor(seoData.optimizedScore - seoData.currentSeo.score)}`} />
                <span className="text-text-muted">
                  Potential improvement: +{seoData.optimizedScore - seoData.currentSeo.score} points
                </span>
              </div>
            </div>

            {/* Suggestions */}
            <div className="space-y-3">
              <h4 className="font-medium text-text-dark flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-earthy-yellow" />
                Optimization Suggestions
              </h4>

              {/* Title Suggestions */}
              {seoData.suggestions?.title && (
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <h5 className="text-sm font-medium text-text-dark mb-2">
                    Title Optimization
                  </h5>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-text-muted">Current:</span>
                      <p className="text-text-dark mt-1">{seoData.suggestions.title.current}</p>
                    </div>
                    <div>
                      <span className="text-sage-green">Suggested:</span>
                      <p className="text-text-dark mt-1">{seoData.suggestions.title.suggested}</p>
                    </div>
                    <div className="text-xs text-text-muted">
                      {seoData.suggestions.title.improvement}
                    </div>
                  </div>
                </div>
              )}

              {/* Description Suggestions */}
              {seoData.suggestions?.description && (
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <h5 className="text-sm font-medium text-text-dark mb-2">
                    Description Optimization
                  </h5>
                  <div className="text-sm space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-text-muted">Length:</span>
                      <span className="text-text-dark">
                        {seoData.suggestions.description.currentLength} → {seoData.suggestions.description.suggestedLength} chars
                      </span>
                    </div>
                    <div className="text-xs text-text-muted">
                      {seoData.suggestions.description.improvement}
                    </div>
                  </div>
                </div>
              )}

              {/* Keywords Suggestions */}
              {seoData.suggestions?.keywords && (
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <h5 className="text-sm font-medium text-text-dark mb-3">
                    Keyword Recommendations
                  </h5>
                  
                  <div className="space-y-3">
                    {seoData.suggestions.keywords.missing?.length > 0 && (
                      <div>
                        <span className="text-xs text-text-muted mb-2 block">Missing Keywords:</span>
                        <div className="flex flex-wrap gap-1">
                          {seoData.suggestions.keywords.missing.map((keyword, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 text-xs bg-sage-green/10 text-sage-green rounded-lg"
                            >
                              +{keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {seoData.suggestions.keywords.trending?.length > 0 && (
                      <div>
                        <span className="text-xs text-text-muted mb-2 block">Trending Keywords:</span>
                        <div className="flex flex-wrap gap-1">
                          {seoData.suggestions.keywords.trending.map((keyword, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 text-xs bg-earthy-yellow/10 text-earthy-yellow rounded-lg"
                            >
                              🔥 {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Action Recommendations */}
            {seoData.recommendations?.length > 0 && (
              <div className="p-4 rounded-2xl bg-muted-olive/5 border border-muted-olive/20">
                <h4 className="font-medium text-text-dark mb-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-muted-olive" />
                  Action Items
                </h4>
                <ul className="space-y-2">
                  {seoData.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <div className="w-2 h-2 rounded-full bg-muted-olive mt-2 flex-shrink-0"></div>
                      <span className="text-text-dark">{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Quick Actions */}
            <div className="flex justify-between items-center pt-4 border-t border-white/10">
              <div className="flex items-center gap-2 text-sm text-text-muted">
                <Info className="w-4 h-4" />
                <span>Apply suggestions to improve search ranking</span>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSeoData(null)}
                >
                  Close
                </Button>
                <Button
                  size="sm"
                  className="bg-sage-green hover:bg-sage-green/90 text-white flex items-center gap-2"
                  onClick={() => {
                    // This would typically open the edit listing form with pre-filled SEO suggestions
                    window.open(`/vendor/listings/${listingId}/edit`, '_blank');
                  }}
                >
                  <ExternalLink className="w-4 h-4" />
                  Apply Changes
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </Card>
  );
};

export default SEOOptimizationPanel;