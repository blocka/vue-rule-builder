import { storiesOf } from "@storybook/vue";
import Builder from "../src/components/Builder";

const fields = [
  {
    name: "ID",
    label: "ID",
    operations: [["Is", "equals"]]
  },
  {
    name: "totalPayments",
    label: "Total Payments",
    operations: [["Greater Than", "gte"]],
    filterable: true,
    fields: [
      {
        name: "department",
        label: "Department",
        operations: [["Is", "equals"]]
      }
    ]
  }
];

const filter = () => ({
  all: true,
  rules: [
    {
      field: "ID",
      operation: "equals",
      value: 4
    },
    {
      field: "totalPayments",
      operation: "gt",
      value: 100,
      filter: {
        all: true,
        rules: [
          {
            field: "department",
            operation: "equals",
            value: 4
          }
        ]
      }
    },
    {
      field: "totalPayments",
      operation: "gt",
      value: 100,
      filter: {
        all: true,
        rules: [{}]
      }
    },
    {
      all: true,
      rules: [
        {
          field: "ID",
          operation: "equals",
          value: 4
        }
      ]
    }
  ]
});

// Add more stories here to live develop your components
storiesOf("Rule Builder", module)
  .add("no filters", () => ({
    data() {
      return {
        filter: null,
        fields
      };
    },
    template: `
  <rule-builder :filter.sync="filter" :fields="fields">
  </rule-builder>
  `
  }))
  .add("one filter", () => ({
    data() {
      return {
        filter: {
          all: true,
          rules: [
            {
              field: null
            }
          ]
        },
        fields
      };
    },
    template: `
  <rule-builder :filter.sync="filter" :fields="fields">
  </rule-builder>
  `
  }))
  .add("two filters", () => ({
    data() {
      return {
        filter: {
          all: true,
          rules: [
            {
              field: null
            },
            {
              field: null
            }
          ]
        },
        fields
      };
    },
    template: `
  <rule-builder :filter.sync="filter" :fields="fields">
  </rule-builder>
  `
  }))
  .add("group", () => ({
    data() {
      return {
        filter: {
          all: true,
          rules: [
            {
              all: true,
              rules: [
                {
                  field: null
                }
              ]
            }
          ]
        },
        fields
      };
    },
    template: `
  <rule-builder :filter.sync="filter" :fields="fields">
  </rule-builder>
  `
  }))
  .add("lots of filters", () => ({
    data() {
      return {
        filter: filter(),
        fields
      };
    },
    template: `
    <rule-builder :filter.sync="filter" :fields="fields">
    </rule-builder>
  `
  }))
  .add("scoped slot", () => ({
    data() {
      return {
        filter: filter(),
        fields
      };
    },
    components: {
      Builder
    },
    template: `
      <rule-builder :filter.sync="filter" :fields="fields">
      <div style="margin-left: 50px; border: 1px dashed black"
        slot-scope="{filter, fields, changeGroupType, getField, setOperation, setField, setValue, addRule, addGroup, componentForRule}">
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
            <select :value="rule.field" @change="setField(rule.id, getField($event.target.value))" data-test="fieldSelector">
              <option :value="null">Field</option>
              <option v-for="(field, j) of fields" :key="j" :value="field.name">
                {{field.label}}
              </option>
            </select>
            <select v-if="rule.field" data-test="operationSelector" @change="setOperation(rule.id, $event.target.value)">
              <option :value="null">Operation</option>
              <option v-for="([label, value]) of getField(rule.field).operations" :value="value" :key="value">
                {{label}}
              </option>
            </select>
            <component
              data-test="valueSetter"
              v-if="rule.operation"
              :is="componentForRule(rule)"
              :value="rule.value"
              :rule="rule"
              @change="setValue(rule.id, $event.target ? $event.target.value : $event)"
            ></component>
            <div v-if="rule.field && getField(rule.field).filterable" data-test="fieldFilter">
              <span v-if="rule.filter.rules.length === 0" @click="addRule(rule.filter.id)">
                + Filter Further
              </span>
              {{getField(rule.field).fields}}
              <Builder class="nested" v-else :fields="getField(rule.field).fields" :filter="rule.filter" /> 
            </div>
          </div>
        </div>
        <button data-test="addRule" @click="addRule(filter.id)">Add Rule</button>
        <button data-test="addGroup" @click="addGroup(filter.id)">Add Group</button>
      </div>
    </rule-builder>    
    `
  }));
