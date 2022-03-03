import fs from 'fs';
import path from 'path';

import * as ts from 'typescript';
import { LoaderContext } from 'webpack';

export default function (this: LoaderContext<unknown>, resourceContent: string) {
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
      if (namesOfRemoveImportStatement.some((name) => name === moduleName)) {
        // remove import statement
        return undefined;
      }
    }

    if (ts.isVariableStatement(node)) {
      const declarationVarNames = node.declarationList.declarations.map((dec) =>
        (dec.name as ts.Identifier).escapedText.toString()
      );

      if (
        declarationVarNames.some((varName) =>
          namesOfRemoveDeclareVarStatement.some((removeVarName) => removeVarName === varName)
        )
      ) {
        // remove variable declaration statement
        return undefined;
      }

      const isExportDeclaration =
        node.modifiers && node.modifiers.some((mod) => mod.kind === ts.SyntaxKind.ExportKeyword);

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
         *   storyName?: string;
         *   parameters?: { [key: string]: any };
         *   decorators?: Array<(story: () => JSX.Element) => JSX.Element>;
         * } = () => <div>hoge</div>;
         *
         */
        const type = context.factory.createTypeLiteralNode([
          ts.createCallSignature(
            undefined,
            [],
            ts.createTypeReferenceNode('JSX.Element', undefined)
          ),
          ts.createPropertySignature(
            undefined,
            ts.createIdentifier('storyName'),
            ts.createToken(ts.SyntaxKind.QuestionToken),
            ts.createTypeReferenceNode('string', undefined),
            undefined
          ),
          ts.createPropertySignature(
            undefined,
            ts.createIdentifier('parameters'),
            ts.createToken(ts.SyntaxKind.QuestionToken),
            ts.createTypeReferenceNode('{ [key: string]: any }', undefined),
            undefined
          ),
          ts.createPropertySignature(
            undefined,
            ts.createIdentifier('decorators'),
            ts.createToken(ts.SyntaxKind.QuestionToken),
            ts.createTypeReferenceNode(
              'Array<(story: () => JSX.Element) => JSX.Element>',
              undefined
            ),
            undefined
          ),
        ]);
        const [oldVariableDeclaration, ...rest] = node.declarationList.declarations;
        const newVariableDeclaration = context.factory.updateVariableDeclaration(
          oldVariableDeclaration,
          oldVariableDeclaration.name,
          oldVariableDeclaration.exclamationToken,
          type,
          oldVariableDeclaration.initializer
        );

        const declarationList = context.factory.updateVariableDeclarationList(
          node.declarationList,
          [newVariableDeclaration, ...rest]
        );
        const newNode: ts.VariableStatement = { ...node, declarationList };

        return newNode;
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
        namesOfRemoveDeclareVarStatement.find((varName) => varName === willAssignVariableName)
      ) {
        return undefined;
      }
    }

    if (
      ts.isFunctionDeclaration(node) &&
      namesOfRemoveDeclareFuncStatement.some((name) => name === node.name?.escapedText.toString())
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
