import { storiesOf } from "@storybook/vue";

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
  }));
