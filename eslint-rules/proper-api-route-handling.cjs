/* eslint-disable @typescript-eslint/ban-ts-comment */
module.exports = {
  meta: {
    type: `problem`,
    fixable: `code`,
    docs: {
      description: `Enforces default export of 'export default Route.initHandler();' for specific routes`,
      category: `Possible Errors`,
      recommended: false,
    },
    schema: [
      {
        type: `object`,
        properties: {
          targetPath: {
            type: `string`,
          },
        },
        additionalProperties: false,
      },
    ], // Defining schema for rule options
  },
  // @ts-ignore
  create: function (context) {
    const configuration = context.options[0] || {};
    const targetPath = configuration.targetPath || `./`; // Default to root dir if not provided

    const filename = context.getFilename();

    if (!filename.includes(targetPath)) {
      return {};
    }

    return {
      // @ts-ignore
      ExportDefaultDeclaration: function (node) {
        if (node.declaration.type === `FunctionDeclaration`) {
          const functionBody = context
            .getSourceCode()
            .getText(node.declaration.body);

          context.report({
            node,
            message: `Use the NextApiRoute class instead of a default exported function for Next.js API routes.`,
            // @ts-ignore
            fix(fixer) {
              return [
                fixer.replaceText(
                  node,
                  `
import { NextApiRoute } from "@/pages/api/util";

class Route extends NextApiRoute {
  ${node.declaration.async ? `async ` : ``}handler(${
    node.declaration.params[0].name
  }: NextApiRequest, ${node.declaration.params[1].name}: NextApiResponse)
    ${functionBody}

}

export default Route.initHandler();
`
                ),
              ];
            },
          });
        }
      },
    };
  },
};
