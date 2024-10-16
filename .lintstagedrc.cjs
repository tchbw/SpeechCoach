const path = require("path");
const buildEslintCommand = (filenames) =>
  `next lint --fix --file ${filenames
    .map((f) => path.relative(process.cwd(), f))
    .join(" --file ")}`;

const runTsc = () => `tsc --noEmit --pretty`; // --project ./tsconfig.react-jsx.json Function syntax allows us ignore files and run tsc on entire codebase
module.exports = {
  "*.{cjs,mjs,js,jsx,ts,tsx}": [buildEslintCommand],
  "*.prisma": ["pnpm lint:prisma", runTsc],
  "*.ts*": runTsc,
  "*": `prettier --list-different --ignore-unknown --write`,
};
