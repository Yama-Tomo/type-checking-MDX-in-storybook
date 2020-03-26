import * as path from 'path';
import initStoryshots from '@storybook/addon-storyshots';
import { imageSnapshot } from '@storybook/addon-storyshots-puppeteer';

type ImageSnapshotArgs = Required<NonNullable<Parameters<typeof imageSnapshot>[0]>>;

const storybookUrl = `file://${path.resolve('./storybook-static')}`;

const beforeScreenshot = async (...args: Parameters<ImageSnapshotArgs['beforeScreenshot']>) => {
  const page = args[0];

  // hidden textbox caret for prevent random failure
  const css = `
    input, textarea {
      caret-color: transparent !important;
    }
  `;
  await page.addStyleTag({ content: css });
};

jest.setTimeout(90000);

initStoryshots({
  suite: 'Image storyshots',
  test: imageSnapshot({
    storybookUrl,
    beforeScreenshot,
    getGotoOptions: () => ({
      waitUntil: 'networkidle2',
    }),
  }),
});
