/* eslint-disable @typescript-eslint/ban-ts-comment */
module.exports = {
  meta: {
    type: `problem`,
    fixable: `code`,
    docs: {
      description: `disallow importing from lodash, enforce submodule imports`,
      category: `Best Practices`,
    },
  },
  // @ts-ignore
  create(context) {
    return {
      // @ts-ignore
      ImportDeclaration(node) {
        if (node.source && node.source.value === `lodash`) {
          context.report({
            node,
            message: `Please import from lodash submodules instead.`,
            // @ts-ignore
            fix(fixer) {
              // Automatically change `import {x} from 'lodash'` to `import x from 'lodash/x'`
              // This assumes a direct 1:1 mapping for submodules, your use case may differ
              const specifiers = node.specifiers;
              const newImports = specifiers
                // @ts-ignore
                .map((spec) => {
                  if (spec.type === `ImportSpecifier`) {
                    return `import ${spec.imported.name} from 'lodash/${spec.imported.name}';\n`;
                  }
                  return ``;
                })
                .join(``);
              return fixer.replaceText(node, newImports.trim());
            },
          });
        }
      },
    };
  },
};
