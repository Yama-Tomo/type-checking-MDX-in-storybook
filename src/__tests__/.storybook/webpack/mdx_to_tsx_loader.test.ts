import { transformAvailableTypeCheckingCode } from '../../../../.storybook/webpack/mdx_to_tsx_loader';

describe('transformAvailableTypeCheckingCode', () => {
  it('should be transpile correctry', () => {
    // ------------------------ jsx --------------------------------
    const beforeCode = `
import React from 'react'
import { mdx } from '@mdx-js/react'

/* @jsx mdx */
import { assertIsFn, AddContext } from "@storybook/addon-docs/blocks";

import { Source, Meta, Story, Preview, Props } from "@storybook/addon-docs/blocks";
import HelloWorld from '~/components/HelloWorld';

const makeShortcode = name => function MDXDefaultShortcode(props) {
  console.warn("Component " + name + " was not imported, exported, or provided by MDXProvider as global scope")
  return <div {...props}/>
};

const layoutProps = {
  
};
const MDXLayout = "wrapper"
function MDXContent({
  components,
  ...props
}) {
  return <MDXLayout {...layoutProps} {...props} components={components} mdxType="MDXLayout">

    <Meta title="example/HelloWorld" mdxType="Meta" />
    <h1 {...{
      "id": "welcome-to-storybook"
    }}>{\`welcome to storybook\`}</h1>
    <Source code={\`import HelloWorld from '~/components/HelloWorld'\`} mdxType="Source" />
    <Preview mdxType="Preview">
  <Story name="Default" mdxType="Story">
    <HelloWorld mdxType="HelloWorld" />
  </Story>
    </Preview>
    <h1 {...{
      "id": "props"
    }}>{\`Props\`}</h1>
    <Props of={HelloWorld} mdxType="Props" />
    <h1 {...{
      "id": "stories"
    }}>{\`stories\`}</h1>
    <h2 {...{
      "id": "size"
    }}>{\`size\`}</h2>
    <Preview mdxType="Preview">
  <Story name="small" mdxType="Story">
    <HelloWorld size="small" mdxType="HelloWorld" />
  </Story>
  <Story name="medium" mdxType="Story">
    <HelloWorld size="medium" mdxType="HelloWorld" />
  </Story>
  <Story name="large" mdxType="Story">
    <HelloWorld size="large" mdxType="HelloWorld" />
  </Story>
    </Preview>
    <h2 {...{
      "id": "color"
    }}>{\`color\`}</h2>
    <Preview mdxType="Preview">
  <Story name="color:#ff0000" mdxType="Story">
    <HelloWorld color="#ff0000" mdxType="HelloWorld" />
  </Story>
    </Preview>
    </MDXLayout>;
}

;
MDXContent.isMDXComponent = true;

export const defaultStory = () => (
          <HelloWorld />
        );
defaultStory.storyName = 'Default';
defaultStory.parameters = { storySource: { source: '<HelloWorld />' } };

export const small = () => (
          <HelloWorld size="small" />
        );
small.storyName = 'small';
small.parameters = { storySource: { source: '<HelloWorld size=\"small\" />' } };

export const medium = () => (
          <HelloWorld size="medium" />
        );
medium.storyName = 'medium';
medium.parameters = { storySource: { source: '<HelloWorld size=\"medium\" />' } };

export const large = () => (
          <HelloWorld size="large" />
        );
large.storyName = 'large';
large.parameters = { storySource: { source: '<HelloWorld size=\"large\" />' } };

export const colorFf0000 = () => (
          <HelloWorld color="#ff0000" />
        );
colorFf0000.storyName = 'color:#ff0000';
colorFf0000.parameters = { storySource: { source: '<HelloWorld color=\"#ff0000\" />' } };

const componentMeta = { title: 'example/HelloWorld', includeStories: ["defaultStory","small","medium","large","colorFf0000"],  };

const mdxStoryNameToKey = {"Default":"defaultStory","small":"small","medium":"medium","large":"large","color:#ff0000":"colorFf0000"};

componentMeta.parameters = componentMeta.parameters || {};
componentMeta.parameters.docs = {
  ...(componentMeta.parameters.docs || {}),
  page: () => <AddContext mdxStoryNameToKey={mdxStoryNameToKey} mdxComponentMeta={componentMeta}><MDXContent /></AddContext>,
};

export default componentMeta;
`;

    // ------------------------ tsx --------------------------------
    const afterCode = `import React from "react";
import HelloWorld from "~/components/HelloWorld";
;
export const defaultStory: {
    (): JSX.Element;
    storyName?: string;
    parameters?: { [key: string]: any };
    decorators?: Array<(story: () => JSX.Element) => JSX.Element>;
} = () => (<HelloWorld />);
defaultStory.storyName = "Default";
defaultStory.parameters = { storySource: { source: "<HelloWorld />" } };
export const small: {
    (): JSX.Element;
    storyName?: string;
    parameters?: { [key: string]: any };
    decorators?: Array<(story: () => JSX.Element) => JSX.Element>;
} = () => (<HelloWorld size="small"/>);
small.storyName = "small";
small.parameters = { storySource: { source: "<HelloWorld size=\\"small\\" />" } };
export const medium: {
    (): JSX.Element;
    storyName?: string;
    parameters?: { [key: string]: any };
    decorators?: Array<(story: () => JSX.Element) => JSX.Element>;
} = () => (<HelloWorld size="medium"/>);
medium.storyName = "medium";
medium.parameters = { storySource: { source: "<HelloWorld size=\\"medium\\" />" } };
export const large: {
    (): JSX.Element;
    storyName?: string;
    parameters?: { [key: string]: any };
    decorators?: Array<(story: () => JSX.Element) => JSX.Element>;
} = () => (<HelloWorld size="large"/>);
large.storyName = "large";
large.parameters = { storySource: { source: "<HelloWorld size=\\"large\\" />" } };
export const colorFf0000: {
    (): JSX.Element;
    storyName?: string;
    parameters?: { [key: string]: any };
    decorators?: Array<(story: () => JSX.Element) => JSX.Element>;
} = () => (<HelloWorld color="#ff0000"/>);
colorFf0000.storyName = "color:#ff0000";
colorFf0000.parameters = { storySource: { source: "<HelloWorld color=\\"#ff0000\\" />" } };
`;

    expect(transformAvailableTypeCheckingCode(beforeCode)).toEqual(afterCode);
  });
});