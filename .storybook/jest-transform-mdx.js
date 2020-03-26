const mdx = require('@mdx-js/mdx')
const { ScriptTransformer } = require('@jest/transform');
const { dedent } = require('ts-dedent')

const createCompiler = require('@storybook/addon-docs/mdx-compiler-plugin')
const compilers = [createCompiler({})]

module.exports = {
  process(src, filename, config, { instrument }) {
    const result = dedent`
      /* @jsx mdx */
      import React from 'react'
      import { mdx } from '@mdx-js/react'
      ${mdx.sync(src, { compilers, filepath: filename })}
    `

    return new ScriptTransformer(config).transformSource(filename + '.jsx', result, instrument)
  }
}