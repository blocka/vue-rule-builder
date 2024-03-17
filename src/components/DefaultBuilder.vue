<template>
  <div class="vrb-container">
    <div>
      <select v-if="filter.rules.length > 1" class="vrb-select" :value="filter.all" data-test="allSelector" @change="changeGroupType(filter.id, JSON.parse($event.target.value))">
        <option :value="true">All of these rules are true</option>
        <option :value="false">Any of these rules are true</option>
      </select>
    </div>
    <div v-for="(rule, i) in filter.rules" :key="i" class="vrb-row">
      <Builder
        v-if="typeof rule.all !== 'undefined'"
        :fields="fields"
        :filter="rule"
        :parent="filter"
        class="vrb-nested"
      />
      <div v-else class="vrb-row">
        <button class="vrb-btn vrb-btn__remove" v-if="filter.rules.length > 1 || filter.id !== 'root'" data-test="removeRule" @click="removeRule(filter.id, rule.id)">x</button>
        <select :value="rule.field" @change="setField(rule.id, getField(value($event)))" data-test="fieldSelector" class="vrb-select">
          <option :value="null">Field</option>
          <option v-for="(field, j) of fields" :key="j" :value="field.name">
            {{ field.label }}
          </option>
        </select>
        <select :value="rule.operation" v-if="rule.field && operationsForField(rule.field)" data-test="operationSelector" @change="setOperation(rule.id, value($event))" class="vrb-select">
          <option :value="null">Operation</option>
          <option v-for="({ label, value }) of operationsForField(rule.field)" :value="value" :key="value">
            {{ label }}
          </option>
        </select>
        <template v-if="rule.operation && !unary(rule.field, rule.operation)">
          <component
            data-test="valueSetter"
            v-if="componentForRule(rule)"
            :is="componentForRule(rule)"
            class="vrb-custom"
            :value="rule.value"
            :rule="rule"
            @change="setValue(rule.id, $event)"
          ></component>
          <input
            data-test="valueSetter"
            class="vrb-input"
            v-else
            :value="rule.value"
            :rule="rule"
            @change="setValue(rule.id, $event.target.value)"
          />
        </template>
        <div v-if="rule.field && isFilterable(rule.field)" data-test="fieldFilter" class="vrb-row">
          <span v-if="rule.filter.rules.length === 0" @click="addRule(rule.filter.id)" class="vrb-filter-further">
            + Filter Further
          </span>
          <Builder class="vrb-nested"
            v-else
            :fields="getField(rule.field).fields"
            :filter="rule.filter"
            :parent="rule"
          />
        </div>
      </div>
    </div>
    <button class="vrb-btn" data-test="addRule" @click="addRule(filter.id)">Add Rule</button>
    <button class="vrb-btn" data-test="addGroup" @click="addGroup(filter.id)">Add Group</button>
    <button class="vrb-btn vrb-btn__remove-group" v-if="filter.id !== 'root' && !subfilter" @click="removeRule(filter.id)" data-test="removeGroup">Remove Group</button>
  </div>
</template>

<script setup>
import { defineComponent, inject, ref } from 'vue';

const Builder = ref(null);

export default defineComponent({
  props: {
    filter: Object,
    fields: Array,
