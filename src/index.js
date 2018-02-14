import RuleBuilder from "./components/RuleBuilder";

const LibraryModule = {
  RuleBuilder,

  install(Vue) {
    // Register components with vue
    Vue.component("rule-builder", RuleBuilder);
  }
};

// Export library
export default LibraryModule;

// Export components
export { RuleBuilder };
