import { HelloWorld } from '~/components/HelloWorld';
import React from 'react';

export const Default: React.FC = () => <HelloWorld />;
export const small: React.FC = () => <HelloWorld size="small" />;
export const medium: React.FC = () => <HelloWorld size="medium" />;
export const large: React.FC = () => <HelloWorld size="large" />;

export const colorRed: React.FC & { storyName: string } = () => <HelloWorld color="red" />;
colorRed.storyName = 'color:#ff0000';

const metaData = { title: 'example/HelloWorld-CSF' };

export default metaData;
