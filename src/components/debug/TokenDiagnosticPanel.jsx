import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectAuth } from '../../store/slices/authSlice';
import {
  checkTokenStorage,
  checkReduxAuthState,
  checkAPIHeaders,
  checkTokenSync,
  checkRequestInterceptors,
  simulateLoginResponseCheck,
  checkNetworkRequests,
  runCompleteTokenDiagnostic,
  fixTokenIssues,
} from '../../utils/tokenDiagnostic';

/**
 * Token Diagnostic Panel Component
 *
 * Temporary component for debugging authentication issues
 * Add this to your app during development to diagnose token problems
 */
const TokenDiagnosticPanel = () => {
  const [diagnosticResult, setDiagnosticResult] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const authState = useSelector(selectAuth);

  const runDiagnostic = async () => {
    setIsRunning(true);
    try {
      const result = await runCompleteTokenDiagnostic();
      setDiagnosticResult(result);
    } catch (error) {
      setDiagnosticResult({ error: error.message });
    } finally {
      setIsRunning(false);
    }
  };

  const handleQuickFix = (fixType) => {
    switch (fixType) {
      case 'clear':
        fixTokenIssues.clearAllTokens();
        break;
      case 'sync':
        fixTokenIssues.syncTokenToStore();
        break;
      case 'refresh':
        fixTokenIssues.refreshUserData();
        break;
      default:
        break;
    }
    // Re-run diagnostic after fix
    setTimeout(runDiagnostic, 1000);
  };

  return (
    <div className="fixed bottom-4 right-4 w-96 max-h-96 overflow-y-auto bg-white dark:bg-gray-800 border-2 border-yellow-400 rounded-lg shadow-lg p-4 z-50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
          🔧 Token Diagnostic
        </h3>
        <div className="text-xs">
          <span
            className={`px-2 py-1 rounded ${authState.isAuthenticated ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
          >
            {authState.isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
          </span>
        </div>
      </div>

      {/* Quick Status */}
      <div className="mb-4 text-sm">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="font-medium">Token:</span>
            <span
              className={`ml-2 px-2 py-1 rounded text-xs ${authState.token ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
            >
              {authState.token ? 'Present' : 'Missing'}
            </span>
          </div>
          <div>
            <span className="font-medium">User:</span>
            <span
              className={`ml-2 px-2 py-1 rounded text-xs ${authState.user ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
            >
              {authState.user?.role || 'None'}
            </span>
          </div>
        </div>
      </div>

      {/* Run Diagnostic Button */}
      <button
        onClick={runDiagnostic}
        disabled={isRunning}
        className="w-full mb-4 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white py-2 px-4 rounded font-medium"
      >
        {isRunning ? '🔄 Running Diagnostic...' : '🔍 Run Complete Diagnostic'}
      </button>

      {/* Individual Diagnostic Buttons */}
      <div className="mb-4">
        <p className="text-sm font-medium mb-2">Individual Checks:</p>
        <div className="grid grid-cols-2 gap-1 text-xs">
          <button
            onClick={() => {
              checkRequestInterceptors();
              console.log('Check console for interceptor results');
            }}
            className="bg-purple-500 hover:bg-purple-600 text-white py-1 px-2 rounded"
          >
            Test Interceptors
          </button>
          <button
            onClick={() => {
              simulateLoginResponseCheck();
              console.log('Check console for login state');
            }}
            className="bg-indigo-500 hover:bg-indigo-600 text-white py-1 px-2 rounded"
          >
            Check Login State
          </button>
          <button
            onClick={() => {
              checkAPIHeaders();
              console.log('Check console for API headers');
            }}
            className="bg-cyan-500 hover:bg-cyan-600 text-white py-1 px-2 rounded"
          >
            API Headers
          </button>
          <button
            onClick={() => {
              checkNetworkRequests();
              console.log('Check console for network test');
            }}
            className="bg-emerald-500 hover:bg-emerald-600 text-white py-1 px-2 rounded"
          >
            Network Test
          </button>
        </div>
      </div>

      {/* Quick Fix Buttons */}
      <div className="mb-4">
        <p className="text-sm font-medium mb-2">Quick Fixes:</p>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => handleQuickFix('clear')}
            className="bg-red-500 hover:bg-red-600 text-white text-xs py-1 px-2 rounded"
          >
            Clear All
          </button>
          <button
            onClick={() => handleQuickFix('sync')}
            className="bg-yellow-500 hover:bg-yellow-600 text-white text-xs py-1 px-2 rounded"
          >
            Sync Token
          </button>
          <button
            onClick={() => handleQuickFix('refresh')}
            className="bg-green-500 hover:bg-green-600 text-white text-xs py-1 px-2 rounded"
          >
            Refresh User
          </button>
        </div>
      </div>

      {/* Diagnostic Results */}
      {diagnosticResult && (
        <div className="border-t pt-4">
          <h4 className="font-medium text-sm mb-2">Diagnostic Results:</h4>

          {diagnosticResult.error ? (
            <div className="text-red-600 text-sm">
              Error: {diagnosticResult.error}
            </div>
          ) : (
            <div className="text-xs space-y-2">
              {/* Issues */}
              {diagnosticResult.issues &&
                diagnosticResult.issues.length > 0 && (
                  <div>
                    <p className="font-medium text-red-600">❌ Issues:</p>
                    <ul className="list-disc list-inside pl-2">
                      {diagnosticResult.issues.map((issue, index) => (
                        <li key={index} className="text-red-600">
                          {issue}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              {/* Recommendations */}
              {diagnosticResult.recommendations &&
                diagnosticResult.recommendations.length > 0 && (
                  <div>
                    <p className="font-medium text-yellow-600">
                      💡 Recommendations:
                    </p>
                    <ul className="list-disc list-inside pl-2">
                      {diagnosticResult.recommendations.map((rec, index) => (
                        <li key={index} className="text-yellow-600">
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              {/* Network Test */}
              {diagnosticResult.network && (
                <div>
                  <p className="font-medium">🌐 Network Test:</p>
                  <p
                    className={`text-xs ${diagnosticResult.network.ok ? 'text-green-600' : 'text-red-600'}`}
                  >
                    Status: {diagnosticResult.network.status}
                    {diagnosticResult.network.ok ? ' ✅' : ' ❌'}
                  </p>
                </div>
              )}

              {/* Token Info */}
              {diagnosticResult.storage?.localStorageDecoded && (
                <div>
                  <p className="font-medium">🔑 Token Info:</p>
                  <p className="text-xs">
                    Expires:{' '}
                    {diagnosticResult.storage.localStorageDecoded.expiresAt?.toLocaleString()}
                  </p>
                  <p className="text-xs">
                    Role:{' '}
                    {diagnosticResult.storage.localStorageDecoded.payload?.role}
                  </p>
                  <p
                    className={`text-xs ${diagnosticResult.storage.localStorageDecoded.isExpired ? 'text-red-600' : 'text-green-600'}`}
                  >
                    {diagnosticResult.storage.localStorageDecoded.isExpired
                      ? 'EXPIRED ❌'
                      : 'VALID ✅'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Console Instructions */}
      <div className="border-t pt-2 mt-4">
        <p className="text-xs text-gray-600 dark:text-gray-400">
          💡 More detailed logs available in browser console
        </p>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Use <code>window.tokenDiagnostic</code> for manual testing
        </p>
      </div>
    </div>
  );
};

export default TokenDiagnosticPanel;
