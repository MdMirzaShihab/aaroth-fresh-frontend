import React, { forwardRef } from 'react';
import { ChevronUp, ChevronDown, MoreVertical } from 'lucide-react';
import { cn } from '../../utils';
import { SkeletonLine } from './LoadingSpinner';

// Main Table component with mobile-first responsive design
const Table = forwardRef(({
  className,
  children,
  ...props
}, ref) => (
  <div className="w-full overflow-x-auto">
    <table
      ref={ref}
      className={cn('w-full caption-bottom text-sm', className)}
      {...props}
    >
      {children}
    </table>
  </div>
));
Table.displayName = 'Table';

// Table Header
const TableHeader = forwardRef(({
  className,
  children,
  ...props
}, ref) => (
  <thead
    ref={ref}
    className={cn('border-b border-gray-200', className)}
    {...props}
  >
    {children}
  </thead>
));
TableHeader.displayName = 'TableHeader';

// Table Body
const TableBody = forwardRef(({
  className,
  children,
  ...props
}, ref) => (
  <tbody
    ref={ref}
    className={cn('divide-y divide-gray-100', className)}
    {...props}
  >
    {children}
  </tbody>
));
TableBody.displayName = 'TableBody';

// Table Footer
const TableFooter = forwardRef(({
  className,
  children,
  ...props
}, ref) => (
  <tfoot
    ref={ref}
    className={cn('border-t border-gray-200 bg-earthy-beige/20', className)}
    {...props}
  >
    {children}
  </tfoot>
));
TableFooter.displayName = 'TableFooter';

// Table Row
const TableRow = forwardRef(({
  className,
  clickable = false,
  onClick,
  children,
  ...props
}, ref) => (
  <tr
    ref={ref}
    className={cn(
      'transition-colors duration-200',
      clickable && 'cursor-pointer hover:bg-earthy-beige/20',
      className
    )}
    onClick={onClick}
    {...props}
  >
    {children}
  </tr>
));
TableRow.displayName = 'TableRow';

// Table Head Cell
const TableHead = forwardRef(({
  className,
  sortable = false,
  sorted,
  onSort,
  children,
  align = 'left',
  ...props
}, ref) => {
  const alignClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }[align];

  const handleSort = () => {
    if (sortable && onSort) {
      const newSorted = sorted === 'asc' ? 'desc' : 'asc';
      onSort(newSorted);
    }
  };

  return (
    <th
      ref={ref}
      className={cn(
        'px-4 py-3 font-medium text-text-dark bg-earthy-beige/10',
        alignClass,
        sortable && 'cursor-pointer hover:bg-earthy-beige/20 select-none',
        className
      )}
      onClick={handleSort}
      {...props}
    >
      <div className="flex items-center gap-2">
        <span className="flex-1">{children}</span>
        {sortable && (
          <div className="flex flex-col">
            <ChevronUp 
              className={cn(
                'w-3 h-3 -mb-1',
                sorted === 'asc' ? 'text-bottle-green' : 'text-text-muted/50'
              )} 
            />
            <ChevronDown 
              className={cn(
                'w-3 h-3',
                sorted === 'desc' ? 'text-bottle-green' : 'text-text-muted/50'
              )} 
            />
          </div>
        )}
      </div>
    </th>
  );
});
TableHead.displayName = 'TableHead';

// Table Cell
const TableCell = forwardRef(({
  className,
  align = 'left',
  children,
  ...props
}, ref) => {
  const alignClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }[align];

  return (
    <td
      ref={ref}
      className={cn(
        'px-4 py-3 text-text-dark',
        alignClass,
        className
      )}
      {...props}
    >
      {children}
    </td>
  );
});
TableCell.displayName = 'TableCell';

// Mobile Card Table for better mobile experience
export const MobileTable = ({
  data = [],
  renderCard,
  keyField = 'id',
  emptyMessage = 'No data available',
  className,
  ...props
}) => (
  <div className={cn('md:hidden space-y-4', className)} {...props}>
    {data.length === 0 ? (
      <div className="text-center py-8 text-text-muted">
        {emptyMessage}
      </div>
    ) : (
      data.map((item, index) => (
        <div
          key={item[keyField] || index}
          className="bg-white rounded-3xl p-4 shadow-sm border border-gray-200"
        >
          {renderCard(item, index)}
        </div>
      ))
    )}
  </div>
);

// Data Table with built-in features
export const DataTable = ({
  data = [],
  columns = [],
  loading = false,
  sortable = false,
  sortKey,
  sortDirection,
  onSort,
  emptyMessage = 'No data available',
  className,
  ...props
}) => {
  if (loading) {
    return <TableSkeleton />;
  }

  return (
    <div className={cn('bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden', className)} {...props}>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead
                key={column.key}
                sortable={sortable && column.sortable}
                sorted={sortKey === column.key ? sortDirection : undefined}
                onSort={onSort ? (direction) => onSort(column.key, direction) : undefined}
                align={column.align}
              >
                {column.title}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center py-8 text-text-muted">
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, index) => (
              <TableRow key={row.id || index}>
                {columns.map((column) => (
                  <TableCell key={column.key} align={column.align}>
                    {column.render ? column.render(row[column.key], row, index) : row[column.key]}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

// Table Skeleton for loading states
export const TableSkeleton = ({ 
  rows = 5, 
  columns = 4,
  className,
  ...props 
}) => (
  <div className={cn('bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden', className)} {...props}>
    <Table>
      <TableHeader>
        <TableRow>
          {Array.from({ length: columns }).map((_, i) => (
            <TableHead key={`header-${i}`}>
              <SkeletonLine height="h-4" width="w-3/4" />
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <TableRow key={`row-${rowIndex}`}>
            {Array.from({ length: columns }).map((_, colIndex) => (
              <TableCell key={`cell-${rowIndex}-${colIndex}`}>
                <SkeletonLine height="h-4" width="w-full" />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
};