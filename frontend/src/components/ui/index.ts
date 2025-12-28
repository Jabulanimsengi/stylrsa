// Radix UI-based components for Stylr SA
// These are accessible, animated, and styled to match your design system

// Accordion - For collapsible content sections
export {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from './Accordion';

// Select - For dropdown menus with search
export {
    Select,
    SelectGroup,
    SelectValue,
    SelectTrigger,
    SelectContent,
    SelectLabel,
    SelectItem,
    SelectSeparator,
} from './Select';

// Tabs - For tab navigation
export { Tabs, TabsList, TabsTrigger, TabsContent } from './Tabs';

// Dropdown Menu - For action menus
export {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuCheckboxItem,
    DropdownMenuRadioItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuGroup,
    DropdownMenuPortal,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuRadioGroup,
} from './DropdownMenu';

// Tooltip - For hover hints
export {
    Tooltip,
    TooltipTrigger,
    TooltipContent,
    TooltipProvider,
    SimpleTooltip,
} from './Tooltip';

// Checkbox - For boolean inputs
export { Checkbox } from './Checkbox';

// Switch - For toggle inputs
export { Switch } from './Switch';

// Popover - For floating panels
export {
    Popover,
    PopoverTrigger,
    PopoverContent,
    PopoverAnchor,
    PopoverClose,
} from './Popover';

// Sheet - For slide-in drawers/panels (mobile navigation)
export {
    Sheet,
    SheetPortal,
    SheetOverlay,
    SheetTrigger,
    SheetClose,
    SheetContent,
    SheetHeader,
    SheetBody,
    SheetFooter,
    SheetTitle,
    SheetDescription,
} from './Sheet';

// Button - For actions and links
export { Button } from './button';
export type { ButtonProps } from './button';

// Card - For content containers
export {
    Card,
    CardHeader,
    CardFooter,
    CardTitle,
    CardDescription,
    CardContent,
} from './card';

// Badge - For status indicators
export { Badge } from './badge';
export type { BadgeProps } from './badge';

// Input - For text inputs
export { Input } from './input';
export type { InputProps } from './input';

// Textarea - For multi-line text inputs
export { Textarea } from './textarea';
export type { TextareaProps } from './textarea';

// Label - For form labels
export { Label } from './label';
export type { LabelProps } from './label';

// FormField - For form field wrappers
export { FormField } from './form-field';

// Alert - For feedback messages
export { Alert } from './alert';
export type { AlertProps } from './alert';

// Progress - For progress bars
export { Progress } from './progress';
export type { ProgressProps } from './progress';

// Spinner - For loading indicators
export { Spinner } from './spinner';
export type { SpinnerProps } from './spinner';

// LoadingButton - Button with loading state
export { LoadingButton } from './loading-button';
export type { LoadingButtonProps } from './loading-button';

// Pagination - For paginated lists
export { Pagination } from './pagination';
export type { PaginationProps } from './pagination';

// EmptyState - For empty list states
export { EmptyState } from './empty-state';
export type { EmptyStateProps } from './empty-state';

// Dialog - For modals
export {
    Dialog,
    DialogPortal,
    DialogOverlay,
    DialogClose,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
    DialogDescription,
} from './dialog';

// AlertDialog - For confirmations
export { AlertDialog } from './alert-dialog';
export type { AlertDialogProps } from './alert-dialog';

// Skeleton - For loading states
export { Skeleton, SkeletonCard, SkeletonList, SkeletonTable } from './skeleton';

// Breadcrumb - For navigation breadcrumbs
export { Breadcrumb } from './breadcrumb';
export type { BreadcrumbItem } from './breadcrumb';

// Avatar - For user avatars
export { Avatar, AvatarGroup } from './avatar';

// Separator - For dividers
export { Separator } from './separator';

// Kbd - For keyboard shortcuts
export { Kbd, KeyboardShortcut } from './kbd';

// StarRating - For ratings display
export { StarRating } from './star-rating';

// =============================================
// NEW SHADCN COMPONENTS (Phase 1 Migration)
// =============================================

// Calendar - For date selection (BookingModal, scheduling)
export { Calendar } from './calendar';
export type { CalendarProps } from './calendar';

// Command - For search/command palette
export {
    Command,
    CommandDialog,
    CommandInput,
    CommandList,
    CommandEmpty,
    CommandGroup,
    CommandItem,
    CommandShortcut,
    CommandSeparator,
} from './command';

// Table - For data tables in admin panels
export {
    Table,
    TableHeader,
    TableBody,
    TableFooter,
    TableHead,
    TableRow,
    TableCell,
    TableCaption,
} from './table';

// RadioGroup - For option selection in forms
export { RadioGroup, RadioGroupItem } from './radio-group';

// Slider - For range inputs (price filters, radius)
export { Slider } from './slider';

// ScrollArea - For custom scrollbars
export { ScrollArea, ScrollBar } from './scroll-area';

// HoverCard - For preview on hover
export { HoverCard, HoverCardTrigger, HoverCardContent } from './hover-card';

// Collapsible - For expandable sections (FAQs, menus)
export { Collapsible, CollapsibleTrigger, CollapsibleContent } from './collapsible';

// AspectRatio - For consistent image sizing
export { AspectRatio } from './aspect-ratio';

// NavigationMenu - For desktop navigation
export {
    NavigationMenu,
    NavigationMenuList,
    NavigationMenuItem,
    NavigationMenuContent,
    NavigationMenuTrigger,
    NavigationMenuLink,
    NavigationMenuIndicator,
    NavigationMenuViewport,
    navigationMenuTriggerStyle,
} from './navigation-menu';

// Button variants utility
export { buttonVariants } from './button-variants';
export type { ButtonVariantsProps } from './button-variants';
