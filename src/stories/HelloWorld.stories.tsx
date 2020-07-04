import React from 'react';
import { HelloWorld } from '~/components/HelloWorld';

export const Default = () => <HelloWorld />;
export const small = () => <HelloWorld size="small" />;
export const medium = () => <HelloWorld size="medium" />;
export const large = () => <HelloWorld size="large" />;

export const colorRed = () => <HelloWorld color="red" />;
colorRed.storyName = 'color:#ff0000';

export default { title: 'example/HelloWorld-CSF' };
