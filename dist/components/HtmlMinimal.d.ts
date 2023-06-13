import React, { ReactNode } from 'react';
interface HtmlProps {
    portal?: React.MutableRefObject<HTMLElement>;
    className?: string;
    name?: string;
    children?: ReactNode;
}
declare const HtmlMinimal: React.ForwardRefExoticComponent<HtmlProps & React.RefAttributes<HTMLDivElement>>;
export { HtmlMinimal };
