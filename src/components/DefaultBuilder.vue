<template>
<div>
  <div>
  <select :value="filter.all" data-test="allSelector" @change="changeGroupType(filter.id, $event.target._value)">
    <option :value="true">All of these rules are true</option>
    <option :value="false">Any of these rules are true></option>
  </select>
  </div>
  <div v-for="(rule, i) of filter.rules" :key="i">
    <Builder
      v-if="typeof rule.all !== 'undefined'"
      :fields="fields"
      :filter="rule"
      class="nested"
    />
    <div v-else>
      <button v-if="filter.rules.length > 1 || filter.id !== 'root'" data-test="removeRule" @click="removeRule(rule.id)">Remove</button>
      <select :value="rule.field" @change="setField(rule.id, getField(value($event)))" data-test="fieldSelector">
        <option :value="null">Field</option>
        <option v-for="(field, j) of fields" :key="j" :value="field.name">
          {{field.label}}
        </option>
      </select>
      <select v-if="rule.field" data-test="operationSelector" @change="setOperation(rule.id, value($event))">
        <option :value="null">Operation</option>
        <option v-for="([label, value]) of operationsForField(rule.field)" :value="value" :key="value">
          {{label}}
        </option>
      </select>
      <component data-test="valueSetter" v-if="rule.operation" :is="getComponentForRule(rule)" :value="rule.value" :rule="rule" @change="setValue(rule, $event)"></component>
      <div v-if="rule.field && isFilterable(rule.field)" data-test="fieldFilter">
        <span v-if="rule.filter.rules.length === 0" @click="addRule(rule.filter.id)">
          + Filter Further
        </span>
        <Builder class="nested" v-else :fields="getField(rule.field).fields" :filter="rule.filter" /> 
      </div>
    </div>
  </div>
  <button data-test="addRule" @click="addRule(filter.id)">Add Rule</button>
  <button data-test="addGroup" @click="addGroup(filter.id)">Add Group</button>
</div>
</template>
<script>
const DefaultBuilder = {
  name: 'DefaultBuilder',
  props: ['filter', 'fields'],
  inject: [
    'addRule',
    'removeRule',
    'addGroup',
    'changeGroupType',
    'setField',
    'setOperation',
    'setValue',
    'componentMap'
  ],
  created () {
    this.$options.components.Builder = require('./Builder').default;
  },
  methods: {
    value (e) {
      return e.target.value;
    },
    operationsForField (field) {
      return this.getField(field).operations; 
    },
    getField (field) {
      return this.fields.find(x => x.name === field);
    },
    isFilterable (field) {
      return this.getField(field).filterable;
    },
    getComponentForRule (rule) {
      return this.componentMap[rule.type] || 'input'
    }
  }
};

export default DefaultBuilder;
</script>