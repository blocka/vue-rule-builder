import uuid from "uuid";
import Builder from "./Builder";
import Vue from "vue";

function normalize(filter, rules) {
  const _rules = rules || {};

  if (filter.all) {
    if (!filter.id) {
      if (Object.values(_rules).length === 0) {
        filter.id = "root";
      } else {
        filter.id = uuid.v4();
      }
    }

    _rules[filter.id] = {
      all: filter.all,
      rules: normalize(filter.rules, _rules),
      id: filter.id
    };
  } else {
    const ids = [];

    for (let rule of filter) {
      if (rule.all) {
        rule = { all: rule.all, rules: normalize(rule.rules, _rules) };
      }

      if (!rule.id) {
        rule.id = uuid.v4();
      }

      rules[rule.id] = rule;

      if (rule.filter) {
        normalize(rule.filter, _rules);

        rule.filter = rule.filter.id;
      }

      ids.push(rule.id);
    }

    return ids;
  }

  return _rules;
}

function denormalize(rule, _rules) {
  const clonedRule = { ...rule };

  if (clonedRule.all) {
    clonedRule.rules = clonedRule.rules
      .map(id => ({ ..._rules[id] }))
      .map(
        rule => (rule.all || rule.filter ? denormalize(rule, _rules) : rule)
      );
  }

  if (clonedRule.filter) {
    clonedRule.filter = { ..._rules[clonedRule.filter] };
    clonedRule.filter = denormalize(clonedRule.filter, _rules);
  }

  return clonedRule;
}

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
      removeRule: this.removeRule
    };
  },
  data() {
    return {
      normalizedFilter: normalize(this.filter || { all: true, rules: [] })
    };
  },
  watch: {
    filter() {
      this.normalizedFilter = normalize(this.filter);
    }
  },
  computed: {
    denormalizedFilter() {
      return denormalize(this.normalizedFilter.root, this.normalizedFilter);
    }
  },
  methods: {
    removeRule(ruleID) {
      Vue.delete(this.normalizedFilter, ruleID);

      for (const rule of Object.values(this.normalizedFilter)) {
        if (typeof rule.all !== "undefined") {
          const index = rule.rules.findIndex(x => x === ruleID);

          if (index > -1) {
            rule.rules.splice(index, 1);
          }
        }

        if (rule.filter) {
          const filterRule = this.normalizedFilter[rule.filter];

          const index = filterRule.rules.findIndex(x => x === ruleID);

          if (index > -1) {
            filterRule.rules.splice(index, 1);
          }
        }
      }

      this.$emit("update:filter", this.denormalizedFilter);
    },
    addRule(parent) {
      const rule = {
        id: uuid.v4(),
        field: null,
        operation: null,
        value: null
      };

      this.normalizedFilter[rule.id] = rule;
      this.normalizedFilter[parent].rules.push(rule.id);

      this.$emit("update:filter", this.denormalizedFilter);
    },
    addGroup(parent) {
      const group = {
        id: uuid.v4(),
        all: true,
        rules: []
      };

      this.normalizedFilter[group.id] = group;
      this.normalizedFilter[parent].rules.push(group.id);

      this.addRule(group.id);
    },
    setField(id, { name, filterable }) {
      const rule = {
        field: name,
        operation: null,
        value: null
      };

      this.normalizedFilter[id] = {
        id,
        ...rule
      };

      if (filterable) {
        const group = {
          id: uuid.v4(),
          all: true,
          rules: []
        };

        this.normalizedFilter[group.id] = group;

        this.normalizedFilter[id].filter = group.id;
      }

      this.$emit("update:filter", this.denormalizedFilter);
    },
    setValue(rule, value) {
      this.normalizedFilter[rule].value = value;

      this.$emit("update:filter", this.denormalizedFilter);
    },
    setOperation(rule, operation) {
      this.normalizedFilter[rule].operation = operation;

      this.$emit("update:filter", this.denormalizedFilter);
    },
    changeGroupType(parent, val) {
      this.normalizedFilter[parent].all = val;

      this.$emit("update:filter", this.denormalizedFilter);
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
