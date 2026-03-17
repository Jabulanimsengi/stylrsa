import { cva, type VariantProps } from 'class-variance-authority';

export const buttonVariants = cva(
    'ui-button',
    {
        variants: {
            variant: {
                default: 'ui-button--primary',
                primary: 'ui-button--primary',
                destructive: 'ui-button--destructive',
                outline: 'ui-button--outline',
                secondary: 'ui-button--secondary',
                ghost: 'ui-button--ghost',
                link: 'ui-button--link',
            },
            size: {
                default: 'ui-button--md',
                sm: 'ui-button--sm',
                lg: 'ui-button--lg',
                icon: 'ui-button--icon',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    }
);

export type ButtonVariantsProps = VariantProps<typeof buttonVariants>;
