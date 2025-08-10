import React, { useState, useRef, useEffect, forwardRef, createContext, useContext } from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { cva } from 'class-variance-authority';
import { cn } from '../../utils';
import Button from './Button';

// Tabs context for managing state
const TabsContext = createContext(null);

// Tab variants following organic design
const tabVariants = cva(
  'relative inline-flex items-center justify-center px-4 py-3 text-sm font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-bottle-green/20 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 whitespace-nowrap min-h-[44px]',
  {
    variants: {
      variant: {
        default: 'text-text-muted hover:text-text-dark data-[state=active]:text-bottle-green data-[state=active]:bg-bottle-green/5 rounded-2xl hover:bg-earthy-beige/30',
        underline: 'text-text-muted hover:text-text-dark data-[state=active]:text-bottle-green border-b-2 border-transparent data-[state=active]:border-bottle-green rounded-none',
        pills: 'text-text-muted hover:text-text-dark data-[state=active]:text-white data-[state=active]:bg-gradient-secondary rounded-2xl hover:bg-earthy-beige/30',
        minimal: 'text-text-muted hover:text-text-dark data-[state=active]:text-bottle-green hover:bg-transparent',
      },
      size: {
        sm: 'px-3 py-2 text-xs min-h-[36px]',
        default: 'px-4 py-3 text-sm min-h-[44px]',
        lg: 'px-6 py-4 text-base min-h-[48px]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

// TabsList container variants
const tabsListVariants = cva(
  'flex items-center relative',
  {
    variants: {
      variant: {
        default: 'gap-1 bg-earthy-beige/20 p-1 rounded-3xl',
        underline: 'gap-0 border-b border-gray-200',
        pills: 'gap-2',
        minimal: 'gap-4',
      },
      scrollable: {
        true: 'overflow-x-auto scrollbar-hide scroll-smooth',
        false: 'flex-wrap',
      },
      justify: {
        start: 'justify-start',
        center: 'justify-center',
        end: 'justify-end',
        between: 'justify-between',
        around: 'justify-around',
      },
    },
    defaultVariants: {
      variant: 'default',
      scrollable: false,
      justify: 'start',
    },
  }
);

/**
 * Enhanced Tabs Component with Mobile Scrolling Support
 * Follows CLAUDE.md patterns for navigation and mobile-first design
 */
const Tabs = forwardRef(({
  value,
  onValueChange,
  defaultValue,
  orientation = 'horizontal',
  className,
  children,
  ...props
}, ref) => {
  const [activeTab, setActiveTab] = useState(value || defaultValue || '');

  const handleTabChange = (newValue) => {
    if (value === undefined) {
      setActiveTab(newValue);
    }
    onValueChange?.(newValue);
  };

  const contextValue = {
    activeTab: value || activeTab,
    onTabChange: handleTabChange,
    orientation,
  };

  useEffect(() => {
    if (value !== undefined) {
      setActiveTab(value);
    }
  }, [value]);

  return (
    <TabsContext.Provider value={contextValue}>
      <div
        ref={ref}
        className={cn('w-full', className)}
        data-orientation={orientation}
        {...props}
      >
        {children}
      </div>
    </TabsContext.Provider>
  );
});

Tabs.displayName = 'Tabs';

// TabsList with mobile scrolling support
const TabsList = forwardRef(({
  variant = 'default',
  size = 'default',
  scrollable = false,
  justify = 'start',
  showScrollButtons = true,
  className,
  children,
  ...props
}, ref) => {
  const context = useContext(TabsContext);
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [showOverflow, setShowOverflow] = useState(false);

  const checkScrollability = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
      setShowOverflow(scrollWidth > clientWidth);
    }
  };

  useEffect(() => {
    checkScrollability();
    const handleResize = () => checkScrollability();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [children]);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  const handleScroll = () => {
    checkScrollability();
  };

  return (
    <div className="relative flex items-center" ref={ref} {...props}>
      {/* Left Scroll Button */}
      {scrollable && showScrollButtons && canScrollLeft && (
        <Button
          variant="ghost"
          size="sm"
          onClick={scrollLeft}
          className="absolute left-0 z-10 bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white min-h-[32px] min-w-[32px] p-1 rounded-full"
          aria-label="Scroll tabs left"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
      )}

      {/* Tabs Container */}
      <div
        ref={scrollContainerRef}
        className={cn(
          tabsListVariants({ variant, scrollable, justify }),
          scrollable && 'snap-x snap-mandatory',
          scrollable && canScrollLeft && 'pl-10',
          scrollable && canScrollRight && 'pr-10',
          className
        )}
        onScroll={handleScroll}
        role="tablist"
        aria-orientation={context?.orientation}
      >
        {React.Children.map(children, (child, index) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, {
              variant,
              size,
              key: child.key || index,
            });
          }
          return child;
        })}
      </div>

      {/* Right Scroll Button */}
      {scrollable && showScrollButtons && canScrollRight && (
        <Button
          variant="ghost"
          size="sm"
          onClick={scrollRight}
          className="absolute right-0 z-10 bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white min-h-[32px] min-w-[32px] p-1 rounded-full"
          aria-label="Scroll tabs right"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      )}

      {/* Overflow Indicator */}
      {scrollable && showOverflow && !showScrollButtons && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted">
          <MoreHorizontal className="w-4 h-4" />
        </div>
      )}
    </div>
  );
});

TabsList.displayName = 'TabsList';

// Individual Tab Trigger
const TabsTrigger = forwardRef(({
  value,
  disabled = false,
  variant,
  size,
  className,
  children,
  ...props
}, ref) => {
  const context = useContext(TabsContext);

  if (!context) {
    throw new Error('TabsTrigger must be used within Tabs component');
  }

  const isActive = context.activeTab === value;

  const handleClick = () => {
    if (!disabled) {
      context.onTabChange(value);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  };

  return (
    <button
      ref={ref}
      className={cn(
        tabVariants({ variant, size }),
        scrollable && 'snap-start flex-shrink-0',
        className
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      data-state={isActive ? 'active' : 'inactive'}
      data-disabled={disabled ? '' : undefined}
      role="tab"
      aria-selected={isActive}
      aria-controls={`tabpanel-${value}`}
      id={`tab-${value}`}
      tabIndex={isActive ? 0 : -1}
      {...props}
    >
      {children}

      {/* Active Tab Indicator for underline variant */}
      {variant === 'underline' && isActive && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-bottle-green rounded-full" />
      )}
    </button>
  );
});

TabsTrigger.displayName = 'TabsTrigger';

// Tab Content Panel
const TabsContent = forwardRef(({
  value,
  forceMount = false,
  className,
  children,
  ...props
}, ref) => {
  const context = useContext(TabsContext);

  if (!context) {
    throw new Error('TabsContent must be used within Tabs component');
  }

  const isActive = context.activeTab === value;

  if (!isActive && !forceMount) {
    return null;
  }

  return (
    <div
      ref={ref}
      className={cn(
        'mt-4 outline-none',
        !isActive && 'hidden',
        className
      )}
      data-state={isActive ? 'active' : 'inactive'}
      role="tabpanel"
      aria-labelledby={`tab-${value}`}
      id={`tabpanel-${value}`}
      tabIndex={0}
      {...props}
    >
      {children}
    </div>
  );
});

TabsContent.displayName = 'TabsContent';

// Pre-built Tab variants for common use cases

// Mobile-Optimized Scrollable Tabs
export const ScrollableTabs = ({ tabs = [], className, ...props }) => (
  <Tabs className={className} {...props}>
    <TabsList scrollable showScrollButtons variant="pills">
      {tabs.map((tab) => (
        <TabsTrigger key={tab.value} value={tab.value}>
          {tab.icon && <span className="mr-2">{tab.icon}</span>}
          {tab.label}
        </TabsTrigger>
      ))}
    </TabsList>
    {tabs.map((tab) => (
      <TabsContent key={tab.value} value={tab.value}>
        {tab.content}
      </TabsContent>
    ))}
  </Tabs>
);

// Underline Tabs for Navigation
export const NavigationTabs = ({ tabs = [], className, ...props }) => (
  <Tabs className={className} {...props}>
    <TabsList variant="underline" justify="start">
      {tabs.map((tab) => (
        <TabsTrigger key={tab.value} value={tab.value}>
          {tab.icon && <span className="mr-2">{tab.icon}</span>}
          {tab.label}
          {tab.badge && (
            <span className="ml-2 bg-tomato-red text-white text-xs px-1.5 py-0.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center">
              {tab.badge}
            </span>
          )}
        </TabsTrigger>
      ))}
    </TabsList>
    {tabs.map((tab) => (
      <TabsContent key={tab.value} value={tab.value}>
        {tab.content}
      </TabsContent>
    ))}
  </Tabs>
);

// Minimal Tabs for Settings/Options
export const SettingsTabs = ({ tabs = [], className, ...props }) => (
  <Tabs className={className} {...props}>
    <TabsList variant="minimal" justify="start">
      {tabs.map((tab) => (
        <TabsTrigger key={tab.value} value={tab.value}>
          {tab.icon && <span className="mr-2">{tab.icon}</span>}
          {tab.label}
        </TabsTrigger>
      ))}
    </TabsList>
    {tabs.map((tab) => (
      <TabsContent key={tab.value} value={tab.value}>
        {tab.content}
      </TabsContent>
    ))}
  </Tabs>
);

// Card-based Tabs
export const CardTabs = ({ tabs = [], className, ...props }) => (
  <Tabs className={className} {...props}>
    <TabsList variant="default" justify="center">
      {tabs.map((tab) => (
        <TabsTrigger key={tab.value} value={tab.value}>
          <div className="text-center">
            {tab.icon && (
              <div className="w-6 h-6 mx-auto mb-1 flex items-center justify-center">
                {tab.icon}
              </div>
            )}
            <div className="text-xs">{tab.label}</div>
            {tab.description && (
              <div className="text-xs opacity-70 mt-1">{tab.description}</div>
            )}
          </div>
        </TabsTrigger>
      ))}
    </TabsList>
    {tabs.map((tab) => (
      <TabsContent key={tab.value} value={tab.value}>
        {tab.content}
      </TabsContent>
    ))}
  </Tabs>
);

// Utility hook for managing tab state
export const useTabs = (initialTab = '') => {
  const [activeTab, setActiveTab] = useState(initialTab);

  const switchTab = (tab) => setActiveTab(tab);
  const isActiveTab = (tab) => activeTab === tab;

  return {
    activeTab,
    setActiveTab,
    switchTab,
    isActiveTab,
  };
};

// Tab animation wrapper for custom transitions
export const AnimatedTabsContent = ({ 
  value, 
  children, 
  animation = 'fade',
  className,
  ...props 
}) => {
  const context = useContext(TabsContext);
  const isActive = context?.activeTab === value;

  const animationClasses = {
    fade: isActive ? 'animate-fade-in' : 'opacity-0',
    slide: isActive ? 'animate-slide-up' : 'translate-y-4 opacity-0',
    scale: isActive ? 'animate-scale-in' : 'scale-95 opacity-0',
  };

  return (
    <TabsContent
      value={value}
      className={cn(
        'transition-all duration-300',
        animationClasses[animation],
        className
      )}
      {...props}
    >
      {children}
    </TabsContent>
  );
};

export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
};

export default Tabs;