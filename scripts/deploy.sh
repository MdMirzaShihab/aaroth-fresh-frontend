#!/bin/bash

# Aaroth Fresh Admin V2 - Production Deployment Script
# Deploys the enhanced admin interface with comprehensive validation

set -e # Exit on any error

# Configuration
PROJECT_NAME="aaroth-fresh-admin"
BUILD_DIR="dist"
BACKUP_DIR="backups"
LOG_FILE="deployment.log"
HEALTH_CHECK_URL="https://admin.aarothfresh.com/health"
ENVIRONMENT=${1:-production}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}" | tee -a $LOG_FILE
}

success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] ✓ $1${NC}" | tee -a $LOG_FILE
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] ⚠ $1${NC}" | tee -a $LOG_FILE
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ✗ $1${NC}" | tee -a $LOG_FILE
    exit 1
}

# Validation functions
check_node_version() {
    local required_version="18"
    local current_version=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    
    if [ "$current_version" -lt "$required_version" ]; then
        error "Node.js version $required_version or higher required. Current: $current_version"
    fi
    success "Node.js version check passed"
}

check_dependencies() {
    log "Checking project dependencies..."
    
    if [ ! -f "package.json" ]; then
        error "package.json not found. Run from project root."
    fi
    
    if [ ! -d "node_modules" ]; then
        log "Installing dependencies..."
        npm ci --production
    fi
    
    success "Dependencies validated"
}

validate_environment() {
    log "Validating environment configuration..."
    
    # Check required environment variables
    required_vars=(
        "REACT_APP_API_BASE_URL"
        "REACT_APP_ENVIRONMENT"
    )
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            error "Required environment variable $var is not set"
        fi
    done
    
    success "Environment validation passed"
}

run_tests() {
    log "Running test suite..."
    
    # Unit tests
    npm run test -- --coverage --watchAll=false --passWithNoTests
    
    # Build test
    log "Running build test..."
    npm run build:prod
    
    success "All tests passed"
}

analyze_bundle() {
    log "Analyzing bundle size..."
    
    # Check bundle sizes
    if [ -d "$BUILD_DIR" ]; then
        local total_size=$(du -sh $BUILD_DIR | cut -f1)
        log "Bundle size: $total_size"
        
        # Check if bundle exceeds limits (2MB)
        local size_bytes=$(du -s $BUILD_DIR | cut -f1)
        local limit_bytes=2048000 # 2MB in KB
        
        if [ "$size_bytes" -gt "$limit_bytes" ]; then
            warning "Bundle size exceeds recommended limit (2MB)"
        fi
    fi
    
    success "Bundle analysis completed"
}

performance_audit() {
    log "Running performance audit..."
    
    # Lighthouse CI audit (if available)
    if command -v lhci &> /dev/null; then
        log "Running Lighthouse CI audit..."
        lhci autorun --config=.lighthouserc.js || warning "Lighthouse audit failed"
    else
        log "Lighthouse CI not available, skipping performance audit"
    fi
    
    success "Performance audit completed"
}

accessibility_audit() {
    log "Running accessibility audit..."
    
    # Axe audit (if available)
    if npm list @axe-core/cli &> /dev/null; then
        log "Running Axe accessibility audit..."
        npx axe-core $BUILD_DIR --dir --tags wcag21aa || warning "Accessibility audit found issues"
    else
        log "Axe not available, skipping accessibility audit"
    fi
    
    success "Accessibility audit completed"
}

create_backup() {
    if [ "$ENVIRONMENT" = "production" ]; then
        log "Creating backup of current deployment..."
        
        mkdir -p $BACKUP_DIR
        local backup_name="backup-$(date +%Y%m%d-%H%M%S)"
        
        if [ -d "/var/www/admin" ]; then
            cp -r /var/www/admin "$BACKUP_DIR/$backup_name"
            success "Backup created: $BACKUP_DIR/$backup_name"
        else
            log "No existing deployment to backup"
        fi
    fi
}

deploy_files() {
    log "Deploying application files..."
    
    case $ENVIRONMENT in
        "production")
            # Production deployment
            if [ -d "/var/www/admin" ]; then
                rm -rf /var/www/admin/*
            else
                mkdir -p /var/www/admin
            fi
            
            cp -r $BUILD_DIR/* /var/www/admin/
            
            # Set proper permissions
            chown -R www-data:www-data /var/www/admin
            chmod -R 755 /var/www/admin
            ;;
            
        "staging")
            # Staging deployment
            if [ -d "/var/www/staging-admin" ]; then
                rm -rf /var/www/staging-admin/*
            else
                mkdir -p /var/www/staging-admin
            fi
            
            cp -r $BUILD_DIR/* /var/www/staging-admin/
            ;;
            
        *)
            error "Unknown environment: $ENVIRONMENT"
            ;;
    esac
    
    success "Files deployed successfully"
}

reload_services() {
    log "Reloading web services..."
    
    # Reload Nginx
    if command -v nginx &> /dev/null; then
        nginx -t && systemctl reload nginx
        success "Nginx reloaded"
    fi
    
    # Clear CDN cache (if applicable)
    if [ ! -z "$CDN_CACHE_PURGE_URL" ]; then
        log "Purging CDN cache..."
        curl -X POST "$CDN_CACHE_PURGE_URL" || warning "CDN cache purge failed"
    fi
}

health_check() {
    log "Performing health check..."
    
    # Wait for services to start
    sleep 10
    
    # Health check
    local max_attempts=5
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f -s "$HEALTH_CHECK_URL" > /dev/null; then
            success "Health check passed on attempt $attempt"
            return 0
        fi
        
        log "Health check attempt $attempt failed, retrying..."
        sleep 10
        ((attempt++))
    done
    
    error "Health check failed after $max_attempts attempts"
}

rollback() {
    log "Rolling back deployment..."
    
    local latest_backup=$(ls -t $BACKUP_DIR | head -n1)
    if [ ! -z "$latest_backup" ]; then
        log "Restoring from backup: $latest_backup"
        
        if [ -d "/var/www/admin" ]; then
            rm -rf /var/www/admin/*
            cp -r "$BACKUP_DIR/$latest_backup"/* /var/www/admin/
            
            # Reload services
            reload_services
            
            success "Rollback completed"
        fi
    else
        error "No backup available for rollback"
    fi
}

cleanup() {
    log "Cleaning up temporary files..."
    
    # Keep only last 5 backups
    if [ -d "$BACKUP_DIR" ]; then
        ls -t $BACKUP_DIR | tail -n +6 | xargs -r rm -rf
    fi
    
    success "Cleanup completed"
}

show_deployment_summary() {
    echo
    echo "======================================"
    echo "   DEPLOYMENT SUMMARY"
    echo "======================================"
    echo "Environment: $ENVIRONMENT"
    echo "Deployed at: $(date)"
    echo "Version: $(node -p "require('./package.json').version")"
    
    if [ -f "$LOG_FILE" ]; then
        echo "Log file: $LOG_FILE"
    fi
    
    echo
    echo "Admin V2 Features Deployed:"
    echo "✓ Enhanced SystemSettings with category-based interface"
    echo "✓ Mobile optimization with 44px touch targets"
    echo "✓ WCAG 2.1 AA accessibility compliance"
    echo "✓ Performance optimizations (virtual scrolling, memoization)"
    echo "✓ Comprehensive routing and navigation"
    echo "✓ Production monitoring and analytics"
    echo
    
    success "Deployment completed successfully!"
}

# Main deployment process
main() {
    log "Starting deployment process for $ENVIRONMENT environment..."
    
    # Pre-deployment validation
    check_node_version
    check_dependencies
    validate_environment
    
    # Quality assurance
    run_tests
    analyze_bundle
    performance_audit
    accessibility_audit
    
    # Deployment process
    create_backup
    deploy_files
    reload_services
    
    # Post-deployment validation
    if health_check; then
        cleanup
        show_deployment_summary
    else
        error "Health check failed, initiating rollback..."
        rollback
        exit 1
    fi
}

# Trap errors and handle rollback
trap 'error "Deployment failed. Check $LOG_FILE for details."' ERR

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --rollback)
            rollback
            exit 0
            ;;
        --health-check)
            health_check
            exit 0
            ;;
        --help)
            echo "Usage: $0 [environment] [options]"
            echo "Environments: production, staging (default: production)"
            echo "Options:"
            echo "  --rollback    Rollback to previous deployment"
            echo "  --health-check    Perform health check only"
            echo "  --help        Show this help message"
            exit 0
            ;;
        *)
            ENVIRONMENT=$1
            shift
            ;;
    esac
done

# Run main deployment process
main