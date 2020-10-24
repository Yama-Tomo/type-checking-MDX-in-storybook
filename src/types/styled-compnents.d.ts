import { FunctionComponent } from 'react';

export type StyledFC<P = Record<string, unknown>> = FunctionComponent<P & { className?: string }>;
