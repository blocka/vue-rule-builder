<template>
  <div>
    <template v-if="!$scopedSlots.default">
      <DefaultBuilder
        :fields="fields"
        :filter="filter"
        :subfilter="subfilter"
        :componentForRule="componentForRule"
        :operationsForField="operationsForField"
        :getField="getField"
      />
    </template>
    <template v-else>
      <slot
        :fields="fields"
        :getField="getField"
        :filter="filter"
        :componentForRule="componentForRule"
        :operationsForField="operationsForField"
        :addRule="addRule"
        :addGroup="addGroup"
        :changeGroupType="changeGroupType"
        :setField="setField"
        :setOperation="setOperation"
        :setValue="setValue"
        :subfilter="subfilter"
        :removeRule="removeRule"
      />
    </template>
  </div>
</template>

<script setup>
import { defineComponent, inject } from 'vue';

export default defineComponent({
  props: {
    filter: Object,
    fields: Array,
    parent: Object, // Assuming parent prop is still used
  },
  inject: [
    "addRule",
    "addGroup",
    "changeGroupType",
    "setField",
    "setOperation",
    "setValue",
    "componentMap",
    "removeRule"
  ],
  computed: {
    subfilter() {
      return this.parent && this.parent.filter;
    }
  },
  methods: {
    getField(field) {
      return this.fields.find(x => x.name === field);
    },
    componentForRule(rule) {
      return this.componentMap[this.getField(rule.field).type];
    },
    operationsForField(field) {
      const ops = this.getField(field).operations;

      if (!ops) return false;

      return ops.map(op => (op.length
        ? {
            value: op[1],
            label: op[0],
            unary: false
          }
        : op));
    }
  }
});
</script>
