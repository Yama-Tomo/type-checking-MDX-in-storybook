import * as ts from 'typescript';
import { loader } from 'webpack';
import fs from 'fs';
import path from 'path';

export default function(this: loader.LoaderContext, resourceContent: string) {
  const callback = this.async();
  const rootPath = this.rootContext;
  const relatePath = this.resourcePath.replace(rootPath, '');

  setTimeout(() => {
    const transpileOutputPath = `.storybook/.mdx_to_tsx/${relatePath}`;

    if (!fs.existsSync(path.dirname(transpileOutputPath))) {
      fs.mkdirSync(path.dirname(transpileOutputPath), { recursive: true });
    }

    const tsxSourceContent = transformAvailableTypeCheckingCode(resourceContent);
    fs.writeFileSync(transpileOutputPath + '.tsx', tsxSourceContent, { encoding: 'utf-8' });

    callback?.(undefined, resourceContent);
  }, 0);
}

// ---------------------------------------------------------------------------------------
//                     Code transformer
// ---------------------------------------------------------------------------------------
export const transformAvailableTypeCheckingCode = (input: string) => {
  const sourceFile = ts.createSourceFile(
    '',
    input,
    ts.ScriptTarget.Latest,
    undefined,
    ts.ScriptKind.TSX
  );

  const transformCode = ts.transform(sourceFile, [transformAvailableTypeCheckingNode]);

  transformCode.dispose();
  return ts.createPrinter().printFile(transformCode.transformed[0] as ts.SourceFile);
};

const namesOfRemoveImportStatement = ['@mdx-js/react', '@storybook/addon-docs/blocks'];
const namesOfRemoveDeclareFuncStatement = ['MDXContent'];
const namesOfRemoveDeclareVarStatement = [
  'makeShortcode',
  'layoutProps',
  'MDXLayout',
  'componentMeta',
  'mdxStoryNameToKey',
  'MDXContent',
];

const transformAvailableTypeCheckingNode = <T extends ts.Node>(
  context: ts.TransformationContext
) => (rootNode: T) => {
  const visit = (node: ts.Node): undefined | ts.Node => {
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
      const moduleName = node.moduleSpecifier.text;
      if (namesOfRemoveImportStatement.some(name => name === moduleName)) {
        // remove import statement
        return undefined;
      }
    }

    if (ts.isVariableStatement(node)) {
      const declarationVarNames = node.declarationList.declarations.map(dec =>
        (dec.name as ts.Identifier).escapedText.toString()
      );

      if (
        declarationVarNames.some(varName =>
          namesOfRemoveDeclareVarStatement.some(removeVarName => removeVarName === varName)
        )
      ) {
        // remove variable declaration statement
        return undefined;
      }

      const isExportDeclaration =
        node.modifiers && node.modifiers.some(mod => mod.kind === ts.SyntaxKind.ExportKeyword);

      if (isExportDeclaration) {
        /**
         * add type assertion
         *
         * :before code
         * export const hogeStory = () => <div>hoge</div>;
         *
         * :after code
         * export const hogeStory: {
         *   (): JSX.Element;
         *   story: Partial<{name: string, parameters: {[key: string]: any}, decorators: Array<(story: () => JSX.Element) => JSX.Element> }>
         * } = () => <div>hoge</div>;
         *
         */
        node.declarationList.declarations[0].type = ts.createTypeLiteralNode([
          ts.createCallSignature(
            undefined,
            [],
            ts.createTypeReferenceNode('JSX.Element', undefined)
          ),
          ts.createPropertySignature(
            undefined,
            ts.createIdentifier('story'),
            undefined,
            ts.createTypeReferenceNode(
              'Partial<{ name: string; parameters: {[key: string]: any}; decorators: Array<(story: () => JSX.Element) => JSX.Element>; }>',
              undefined
            ),
            undefined
          ),
        ]);
      }

      return node;
    }

    if (
      ts.isExpressionStatement(node) &&
      ts.isBinaryExpression(node.expression) &&
      ts.isPropertyAccessExpression(node.expression.left)
    ) {
      const willAssignVariableName = (() => {
        if (ts.isIdentifier(node.expression.left.expression)) {
          return node.expression.left.expression.escapedText.toString();
        }

        if (
          ts.isPropertyAccessExpression(node.expression.left.expression) &&
          ts.isIdentifier(node.expression.left.expression.expression)
        ) {
          return node.expression.left.expression.expression.escapedText.toString();
        }

        return undefined;
      })();

      if (
        willAssignVariableName &&
        namesOfRemoveDeclareVarStatement.find(varName => varName === willAssignVariableName)
      ) {
        return undefined;
      }
    }

    if (
      ts.isFunctionDeclaration(node) &&
      namesOfRemoveDeclareFuncStatement.some(name => name === node.name?.escapedText.toString())
    ) {
      return undefined;
    }

    if (ts.isExportAssignment(node)) {
      return undefined;
    }

    return ts.visitEachChild(node, visit, context);
  };

  return ts.visitNode(rootNode, visit);
};