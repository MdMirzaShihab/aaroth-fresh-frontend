import React, {
  useState,
  useRef,
  useEffect,
  forwardRef,
  createContext,
  useContext,
} from 'react';
import {
  ChevronDown,
  ChevronUp,
  Check,
  Search,
  X,
  MoreVertical,
  Filter,
  User,
  Settings,
  HelpCircle,
} from 'lucide-react';
import { cva } from 'class-variance-authority';
import { cn } from '../../utils';
import Button from './Button';
import { Input } from './Input';

// Dropdown context for managing state
const DropdownContext = createContext(null);

// Dropdown variants following touch-friendly design
const dropdownVariants = cva('relative inline-block', {
  variants: {
    width: {
      auto: 'w-auto',
      full: 'w-full',
      sm: 'w-48',
      md: 'w-64',
      lg: 'w-80',
      xl: 'w-96',
    },
  },
  defaultVariants: {
    width: 'auto',
  },
});

// Dropdown trigger variants
const triggerVariants = cva(
  'inline-flex items-center justify-between gap-2 rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-text-dark transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-bottle-green/20 focus:border-bottle-green disabled:pointer-events-none disabled:opacity-50 min-h-[44px]',
  {
    variants: {
      variant: {
        default: 'hover:bg-earthy-beige/20 hover:border-bottle-green/30',
        ghost: 'border-transparent bg-transparent hover:bg-earthy-beige/20',
        outline: 'border-2 border-bottle-green/30 hover:border-bottle-green',
        filled:
          'bg-earthy-beige/30 border-transparent hover:bg-earthy-beige/40',
      },
      size: {
        sm: 'px-3 py-2 text-xs min-h-[36px]',
        default: 'px-4 py-3 text-sm min-h-[44px]',
        lg: 'px-6 py-4 text-base min-h-[48px]',
      },
      width: {
        auto: 'w-auto',
        full: 'w-full',
        sm: 'w-48',
        md: 'w-64',
        lg: 'w-80',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      width: 'auto',
    },
  }
);

// Dropdown menu variants
const menuVariants = cva(
  'absolute z-50 mt-2 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 animate-scale-in max-h-80 overflow-y-auto scrollbar-hide',
  {
    variants: {
      position: {
        'bottom-left': 'top-full left-0',
        'bottom-right': 'top-full right-0',
        'top-left': 'bottom-full left-0 mb-2',
        'top-right': 'bottom-full right-0 mb-2',
        'bottom-center': 'top-full left-1/2 -translate-x-1/2',
        'top-center': 'bottom-full left-1/2 -translate-x-1/2 mb-2',
      },
      width: {
        trigger: 'w-full',
        auto: 'w-auto min-w-[200px]',
        sm: 'w-48',
        md: 'w-64',
        lg: 'w-80',
        xl: 'w-96',
      },
    },
    defaultVariants: {
      position: 'bottom-left',
      width: 'trigger',
    },
  }
);

// Dropdown item variants
const itemVariants = cva(
  'flex items-center gap-3 px-4 py-3 text-sm text-text-dark transition-all duration-200 cursor-pointer hover:bg-bottle-green/5 focus:bg-bottle-green/5 focus:outline-none disabled:pointer-events-none disabled:opacity-50 min-h-[44px]',
  {
    variants: {
      variant: {
        default: '',
        destructive:
          'text-tomato-red hover:bg-tomato-red/5 focus:bg-tomato-red/5',
        success:
          'text-bottle-green hover:bg-bottle-green/10 focus:bg-bottle-green/10',
      },
      selected: {
        true: 'bg-bottle-green/10 text-bottle-green font-medium',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      selected: false,
    },
  }
);

/**
 * Enhanced Dropdown Component with Touch-Friendly Interactions
 * Follows CLAUDE.md patterns for mobile-first design and accessibility
 */
const Dropdown = forwardRef(
  (
    {
      open,
      onOpenChange,
      defaultOpen = false,
      width = 'auto',
      className,
      children,
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(open ?? defaultOpen);
    const dropdownRef = useRef(null);

    const handleOpenChange = (newOpen) => {
      if (open === undefined) {
        setIsOpen(newOpen);
      }
      onOpenChange?.(newOpen);
    };

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        handleOpenChange(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        handleOpenChange(false);
      }
    };

    useEffect(() => {
      if (open !== undefined) {
        setIsOpen(open);
      }
    }, [open]);

    useEffect(() => {
      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);
        return () => {
          document.removeEventListener('mousedown', handleClickOutside);
          document.removeEventListener('keydown', handleEscape);
        };
      }
    }, [isOpen]);

    const contextValue = {
      isOpen: open ?? isOpen,
      onOpenChange: handleOpenChange,
    };

    return (
      <DropdownContext.Provider value={contextValue}>
        <div
          ref={dropdownRef}
          className={cn(dropdownVariants({ width }), className)}
          {...props}
        >
          {children}
        </div>
      </DropdownContext.Provider>
    );
  }
);

Dropdown.displayName = 'Dropdown';

// Dropdown Trigger
const DropdownTrigger = forwardRef(
  (
    {
      variant = 'default',
      size = 'default',
      width = 'auto',
      placeholder = 'Select option...',
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const context = useContext(DropdownContext);

    if (!context) {
      throw new Error('DropdownTrigger must be used within Dropdown');
    }

    const handleClick = () => {
      if (!disabled) {
        context.onOpenChange(!context.isOpen);
      }
    };

    const handleKeyDown = (event) => {
      if (
        !disabled &&
        (event.key === 'Enter' ||
          event.key === ' ' ||
          event.key === 'ArrowDown')
      ) {
        event.preventDefault();
        context.onOpenChange(true);
      }
    };

    return (
      <button
        ref={ref}
        className={cn(triggerVariants({ variant, size, width }), className)}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-expanded={context.isOpen}
        aria-haspopup="listbox"
        role="combobox"
        {...props}
      >
        <span className="flex-1 text-left truncate">
          {children || placeholder}
        </span>

        {context.isOpen ? (
          <ChevronUp className="w-4 h-4 text-text-muted flex-shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-text-muted flex-shrink-0" />
        )}
      </button>
    );
  }
);

DropdownTrigger.displayName = 'DropdownTrigger';

// Dropdown Content/Menu
const DropdownContent = forwardRef(
  (
    {
      position = 'bottom-left',
      width = 'trigger',
      className,
      children,
      ...props
    },
    ref
  ) => {
    const context = useContext(DropdownContext);

    if (!context) {
      throw new Error('DropdownContent must be used within Dropdown');
    }

    if (!context.isOpen) {
      return null;
    }

    return (
      <div
        ref={ref}
        className={cn(menuVariants({ position, width }), className)}
        role="listbox"
        {...props}
      >
        <div className="py-2">{children}</div>
      </div>
    );
  }
);

DropdownContent.displayName = 'DropdownContent';

// Dropdown Item
const DropdownItem = forwardRef(
  (
    {
      value,
      selected = false,
      disabled = false,
      variant = 'default',
      icon: IconComponent,
      shortcut,
      className,
      children,
      onClick,
      ...props
    },
    ref
  ) => {
    const context = useContext(DropdownContext);

    const handleClick = (event) => {
      if (!disabled) {
        onClick?.(event, value);
        if (!event.defaultPrevented) {
          context?.onOpenChange(false);
        }
      }
    };

    const handleKeyDown = (event) => {
      if (!disabled && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        handleClick(event);
      }
    };

    return (
      <div
        ref={ref}
        className={cn(itemVariants({ variant, selected }), className)}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        role="option"
        aria-selected={selected}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        {...props}
      >
        {IconComponent && <IconComponent className="w-4 h-4 flex-shrink-0" />}

        <span className="flex-1 truncate">{children}</span>

        {selected && (
          <Check className="w-4 h-4 text-bottle-green flex-shrink-0" />
        )}

        {shortcut && (
          <span className="text-xs text-text-muted bg-earthy-beige/30 px-2 py-1 rounded-lg flex-shrink-0">
            {shortcut}
          </span>
        )}
      </div>
    );
  }
);

DropdownItem.displayName = 'DropdownItem';

// Dropdown Separator
const DropdownSeparator = forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('h-px bg-gray-200 my-2 mx-4', className)}
    role="separator"
    {...props}
  />
));

DropdownSeparator.displayName = 'DropdownSeparator';

// Dropdown Label/Header
const DropdownLabel = forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'px-4 py-2 text-xs font-medium text-text-muted uppercase tracking-wide',
      className
    )}
    {...props}
  >
    {children}
  </div>
));

DropdownLabel.displayName = 'DropdownLabel';

// Pre-built Dropdown variants for common use cases

// Select Dropdown with search
export const SelectDropdown = ({
  value,
  onValueChange,
  options = [],
  placeholder = 'Select option...',
  searchable = false,
  multiple = false,
  className,
  ...props
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOptions = searchable
    ? options.filter((option) =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  const selectedOption = options.find((opt) => opt.value === value);
  const selectedOptions = multiple
    ? options.filter((opt) => value?.includes(opt.value))
    : [];

  const handleSelect = (optionValue) => {
    if (multiple) {
      const currentValues = value || [];
      const newValues = currentValues.includes(optionValue)
        ? currentValues.filter((v) => v !== optionValue)
        : [...currentValues, optionValue];
      onValueChange?.(newValues);
    } else {
      onValueChange?.(optionValue);
    }
  };

  const getDisplayText = () => {
    if (multiple) {
      if (selectedOptions.length === 0) return placeholder;
      if (selectedOptions.length === 1) return selectedOptions[0].label;
      return `${selectedOptions.length} selected`;
    }
    return selectedOption?.label || placeholder;
  };

  return (
    <Dropdown className={className} {...props}>
      <DropdownTrigger>{getDisplayText()}</DropdownTrigger>

      <DropdownContent>
        {searchable && (
          <div className="px-3 pb-2">
            <Input
              placeholder="Search options..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              variant="search"
              size="sm"
              leftIcon={Search}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}

        {filteredOptions.length === 0 ? (
          <div className="px-4 py-8 text-center text-text-muted text-sm">
            {searchTerm ? 'No options found' : 'No options available'}
          </div>
        ) : (
          filteredOptions.map((option) => (
            <DropdownItem
              key={option.value}
              value={option.value}
              selected={
                multiple
                  ? value?.includes(option.value)
                  : value === option.value
              }
              onClick={() => handleSelect(option.value)}
              icon={option.icon}
            >
              {option.label}
            </DropdownItem>
          ))
        )}
      </DropdownContent>
    </Dropdown>
  );
};

// Action Menu Dropdown
export const ActionMenuDropdown = ({
  actions = [],
  trigger,
  className,
  ...props
}) => (
  <Dropdown className={className} {...props}>
    <DropdownTrigger variant="ghost">
      {trigger || <MoreVertical className="w-4 h-4" />}
    </DropdownTrigger>

    <DropdownContent position="bottom-right" width="auto">
      {actions.map((action, index) => (
        <React.Fragment key={action.key || index}>
          {action.type === 'separator' ? (
            <DropdownSeparator />
          ) : action.type === 'label' ? (
            <DropdownLabel>{action.label}</DropdownLabel>
          ) : (
            <DropdownItem
              icon={action.icon}
              variant={action.variant}
              shortcut={action.shortcut}
              disabled={action.disabled}
              onClick={action.onClick}
            >
              {action.label}
            </DropdownItem>
          )}
        </React.Fragment>
      ))}
    </DropdownContent>
  </Dropdown>
);

// User Profile Dropdown
export const ProfileDropdown = ({
  user,
  menuItems = [],
  onSignOut,
  className,
  ...props
}) => (
  <Dropdown className={className} {...props}>
    <DropdownTrigger variant="ghost" className="flex items-center gap-2 px-2">
      <div className="w-8 h-8 rounded-full bg-bottle-green/10 flex items-center justify-center">
        <User className="w-4 h-4 text-bottle-green" />
      </div>
      <div className="text-left hidden sm:block">
        <div className="text-sm font-medium truncate">{user?.name}</div>
        <div className="text-xs text-text-muted truncate">{user?.email}</div>
      </div>
    </DropdownTrigger>

    <DropdownContent position="bottom-right" width="auto">
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="font-medium text-sm">{user?.name}</div>
        <div className="text-xs text-text-muted">{user?.email}</div>
      </div>

      {menuItems.map((item, index) => (
        <DropdownItem key={index} icon={item.icon} onClick={item.onClick}>
          {item.label}
        </DropdownItem>
      ))}

      {menuItems.length > 0 && <DropdownSeparator />}

      <DropdownItem icon={Settings} onClick={() => {}} variant="default">
        Settings
      </DropdownItem>

      <DropdownItem icon={HelpCircle} onClick={() => {}} variant="default">
        Help & Support
      </DropdownItem>

      <DropdownSeparator />

      <DropdownItem icon={X} onClick={onSignOut} variant="destructive">
        Sign Out
      </DropdownItem>
    </DropdownContent>
  </Dropdown>
);

// Filter Dropdown
export const FilterDropdown = ({
  filters = [],
  activeFilters = {},
  onFilterChange,
  className,
  ...props
}) => {
  const activeCount = Object.values(activeFilters).filter(Boolean).length;

  return (
    <Dropdown className={className} {...props}>
      <DropdownTrigger variant="outline">
        <Filter className="w-4 h-4 mr-2" />
        Filters
        {activeCount > 0 && (
          <span className="ml-2 bg-bottle-green text-white text-xs px-1.5 py-0.5 rounded-full min-w-[20px] h-5 flex items-center justify-center">
            {activeCount}
          </span>
        )}
      </DropdownTrigger>

      <DropdownContent width="md">
        {filters.map((filter) => (
          <div key={filter.key} className="px-4 py-2">
            <DropdownLabel>{filter.label}</DropdownLabel>
            {filter.options.map((option) => (
              <DropdownItem
                key={option.value}
                selected={activeFilters[filter.key] === option.value}
                onClick={() => onFilterChange?.(filter.key, option.value)}
              >
                {option.label}
              </DropdownItem>
            ))}
          </div>
        ))}
      </DropdownContent>
    </Dropdown>
  );
};

// Utility hooks for dropdown state management
export const useDropdown = (initialOpen = false) => {
  const [isOpen, setIsOpen] = useState(initialOpen);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen(!isOpen);

  return {
    isOpen,
    setIsOpen,
    open,
    close,
    toggle,
  };
};

export const useSelectDropdown = (initialValue = '', multiple = false) => {
  const [value, setValue] = useState(multiple ? [] : initialValue);

  const handleValueChange = (newValue) => {
    setValue(newValue);
  };

  const clearValue = () => {
    setValue(multiple ? [] : '');
  };

  const isSelected = (option) => {
    if (multiple) {
      return value.includes(option);
    }
    return value === option;
  };

  return {
    value,
    setValue,
    handleValueChange,
    clearValue,
    isSelected,
  };
};

export {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
  DropdownSeparator,
  DropdownLabel,
};

export default Dropdown;
