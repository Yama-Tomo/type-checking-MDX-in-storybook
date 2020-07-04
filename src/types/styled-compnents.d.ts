import { FunctionComponent } from 'react';

export type StyledFC<P = {}> = FunctionComponent<P & { className?: string }>;
