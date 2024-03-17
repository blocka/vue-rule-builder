<template>
  <Builder
    :filter="denormalizedFilter"
    :fields="fields"
  />
</template>

<script setup>
import Builder from "./Builder.vue";
import {
  normalize,
  denormalize,
  removeRule,
  addRule,
  addIDs,
  stripIDs,
  addFilter
} from "../lib/util";

const props = defineProps({
  filter: Object,
  fields: Array,
  componentMap: Object
});

const emit = defineEmits(['update:filter']);

const normalizedFilter = ref(normalize(addIDs(props.filter || { all: true, rules: [] })));

watch(
  () => props.filter,
  (newFilter) => {
    normalizedFilter.value = normalize(addIDs(newFilter));
  },
  { immediate: true }
);

const removeRule = (filterID, ruleID) => {
  // ... (same logic as before)
};

const addRule = (parent) => {
  // ... (same logic as before)
};

const addGroup = (parent) => {
  // ... (same logic as before)
};

const setField = (id, { name, filterable, operations }) => {
  // ... (same logic as before)
};

const setValue = (rule, value) => {
  // ... (same logic as before)
};

const setOperation = (rule, operation) => {
  // ... (same logic as before)
};

const changeGroupType = (parent, val) => {
  // ... (same logic as before)
};

provide('addRule', addRule);
provide('addGroup', addGroup);
provide('changeGroupType', changeGroupType);
provide('setField', setField);
provide('setOperation', setOperation);
provide('setValue', setValue);
provide('componentMap', props.componentMap || {});
provide('removeRule', removeRule);
provide('normalizedFilter', normalizedFilter);
</script>
