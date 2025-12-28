'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import {
    Table,
    TableHeader,
    TableBody,
    TableHead,
    TableRow,
    TableCell,
} from '@/components/ui';
import { Skeleton } from '@/components/ui';

// Reusable data table component built on Shadcn Table primitives
// For complex needs (sorting, filtering, pagination), consider @tanstack/react-table

interface Column<T> {
    key: string;
    header: string;
    accessor: keyof T | ((row: T) => React.ReactNode);
    className?: string;
}

interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    keyExtractor: (row: T) => string;
    onRowClick?: (row: T) => void;
    emptyMessage?: string;
    isLoading?: boolean;
    className?: string;
}

export function DataTable<T>({
    columns,
    data,
    keyExtractor,
    onRowClick,
    emptyMessage = 'No data available',
    isLoading = false,
    className,
}: DataTableProps<T>) {
    const renderCell = (row: T, column: Column<T>) => {
        if (typeof column.accessor === 'function') {
            return column.accessor(row);
        }
        const value = row[column.accessor];
        return value as React.ReactNode;
    };

    if (isLoading) {
        return (
            <div className={cn('w-full rounded-lg border', className)}>
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50 hover:bg-muted/50">
                            {columns.map((col) => (
                                <TableHead key={col.key}>
                                    <Skeleton className="h-4 w-24" />
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {[1, 2, 3, 4, 5].map((i) => (
                            <TableRow key={i}>
                                {columns.map((col) => (
                                    <TableCell key={col.key}>
                                        <Skeleton className="h-4 w-full" />
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="w-full rounded-lg border p-8 text-center text-muted-foreground">
                {emptyMessage}
            </div>
        );
    }

    return (
        <div className={cn('rounded-lg border', className)}>
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                        {columns.map((col) => (
                            <TableHead
                                key={col.key}
                                className={col.className}
                            >
                                {col.header}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((row) => (
                        <TableRow
                            key={keyExtractor(row)}
                            className={cn(
                                onRowClick && 'cursor-pointer'
                            )}
                            onClick={() => onRowClick?.(row)}
                        >
                            {columns.map((col) => (
                                <TableCell
                                    key={col.key}
                                    className={col.className}
                                >
                                    {renderCell(row, col)}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

export default DataTable;
