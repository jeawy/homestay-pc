/* module.exports = {
  presets: [
    '@vue/app'
  ]
} */
const presets = [
  "@vue/app",
  [
    "@babel/preset-env",
    {
      targets: {
        browsers: ["> 1%", "last 2 versions"]
      }
    }
  ]
];
const plugins = [
  [
    "import",
    {
      libraryName: "iview",
      libraryDirectory: "src/components"
    }
  ]
];
module.exports = {
  presets,
  plugins
};
