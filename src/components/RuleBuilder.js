import Builder from "./Builder";

import {
  normalize,
  denormalize,
  removeRule,
  addRule,
  addIDs,
  stripIDs,
  addFilter
} from "../lib/util";

export default {
  props: ["filter", "fields", "componentMap"],
  name: "RuleBuilder",
  provide() {
    return {
      addRule: this.addRule,
      addGroup: this.addGroup,
      changeGroupType: this.changeGroupType,
      setField: this.setField,
      setOperation: this.setOperation,
      setValue: this.setValue,
      componentMap: this.componentMap || {},
      removeRule: this.removeRule,
      normalizedFilter: this.normalizedFilter
    };
  },
  data() {
    return {
      normalizedFilter: normalize(
        addIDs(this.filter || { all: true, rules: [] })
      )
    };
  },
  watch: {
    filter() {
      this.normalizedFilter = normalize(addIDs(this.filter));
    }
  },
  computed: {
    denormalizedFilter() {
      return denormalize(this.normalizedFilter);
    }
  },
  methods: {
    removeRule(filterID, ruleID) {
      if (!ruleID) {
        ruleID = filterID;
        filterID = Object.values(this.normalizedFilter)
          .filter(x => x.rules)
          .find(x => x.rules.includes(filterID)).id;
      }

      this.normalizedFilter = removeRule(
        this.normalizedFilter,
        filterID,
        ruleID
      );

      this.$emit("update:filter", stripIDs(this.denormalizedFilter));
    },
    addRule(parent) {
      this.normalizedFilter = addRule(this.normalizedFilter, parent);

      this.$emit("update:filter", stripIDs(this.denormalizedFilter));
    },
    addGroup(parent) {
      this.normalizedFilter = addFilter(this.normalizedFilter, parent);
      this.$emit("update:filter", stripIDs(this.denormalizedFilter));
    },
    setField(id, { name, filterable }) {
      const rule = {
        field: name,
        operation: null,
        value: null
      };

      let normalizedFilter = {
        ...this.normalizedFilter,
        [id]: {
          id,
          ...rule
        }
      };

      if (filterable) {
        normalizedFilter = addFilter(normalizedFilter, id);
      }

      this.normalizedFilter = normalizedFilter;

      this.$emit("update:filter", stripIDs(this.denormalizedFilter));
    },
    setValue(rule, value) {
      this.normalizedFilter[rule].value = value;

      this.$emit("update:filter", stripIDs(this.denormalizedFilter));
    },
    setOperation(rule, operation) {
      this.normalizedFilter[rule].operation = operation;

      this.$emit("update:filter", stripIDs(this.denormalizedFilter));
    },
    changeGroupType(parent, val) {
      this.normalizedFilter[parent].all = val;

      this.$emit("update:filter", stripIDs(this.denormalizedFilter));
    }
  },
  render(h) {
    return h(Builder, {
      props: {
        filter: this.denormalizedFilter,
        fields: this.fields
      },
      scopedSlots: {
        default: this.$scopedSlots.default
      }
    });
  }
};
