// src/core/error/ErrorBoundary.js
import React, { Component } from 'react';
// import { coreLogger } from '../logging';
import { LOG_LEVELS } from '../../reducers/metadata/metadataReducer';
import { ErrorAlert } from './ErrorAlert';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
    console.log('ErrorBoundary', {
      timestamp: new Date().toISOString(),
      props: Object.keys(props)})
    
    // coreLogger.logServiceInitStart('ErrorBoundary', {
    //   timestamp: new Date().toISOString(),
    //   props: Object.keys(props)
    // });
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    const startTime = performance.now();
    
    // coreLogger.logServiceError('ErrorBoundary', error, {
        console.log('ErrorBoundary', error, {
        errorInfo,
        context: {
        location: window.location.href,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        viewportSize: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      }
    });

    if (this.props.onError) {
      try {
        this.props.onError(error, errorInfo);
      } catch (handlerError) {
       // coreLogger.logServiceError('ErrorBoundary', handlerError, {
     console.log('ErrorBoundary', handlerError, {
       originalError: error.message
        });
      }
    }
  }

  handleReload = () => {
    //coreLogger.logEvent('ErrorBoundary', LOG_LEVELS.STATE, 'Application reload requested', {
    console.log('ErrorBoundary', LOG_LEVELS.STATE, 'Application reload requested', {
        error: this.state.error?.message,
      timestamp: new Date().toISOString()
    });
    
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return <ErrorAlert error={this.state.error} onReload={this.handleReload} />;
    }

    return this.props.children;
  }
}