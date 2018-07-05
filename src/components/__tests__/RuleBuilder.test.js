import RuleBuilder from "../RuleBuilder";
import { mount } from "@vue/test-utils";
import Vue from "vue";

const fields = [
  {
    name: "ID",
    label: "ID",
    operations: [["Is", "equals"]],
    type: "number"
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

describe("RuleBuilder.vue", () => {
  test("clicking add rule adds a blank rule", () => {
    const spy = jest.fn();

    const wrapper = mount({
      data() {
        return {
          fields,
          filter: {
            all: true,
            rules: []
          }
        };
      },
      methods: {
        spy
      },
      components: { RuleBuilder },
      template: `
      <rule-builder :filter="filter" @update:filter="spy" :fields="fields">
      </rule-builder>
    `
    });

    const btn = wrapper.find('[data-test="addRule"]');

    btn.trigger("click");

    const { field, operation, value } = spy.mock.calls[0][0].rules[0];

    expect({ field, operation, value }).toEqual({
      field: null,
      operation: null,
      value: null
    });
  });

  test("changing the group type", () => {
    const spy = jest.fn();

    const wrapper = mount({
      data() {
        return {
          fields,
          filter: {
            all: true,
            rules: [{
              field: null
            },{
              field: null
            }]
          }
        };
      },
      methods: {
        spy
      },
      components: { RuleBuilder },
      template: `
      <rule-builder :filter="filter" @update:filter="spy" :fields="fields">
      </rule-builder>
    `
    });

    const select = wrapper.find('[data-test="allSelector"]');

    select
      .findAll("option")
      .at(1)
      .trigger("change");

    const expected = spy.mock.calls[0][0].all;

    expect(expected).toBeFalsy();
  });

  test("adding a new group", () => {
    const spy = jest.fn();

    const wrapper = mount({
      data() {
        return {
          fields,
          filter: {
            all: true,
            rules: []
          }
        };
      },
      methods: {
        spy
      },
      components: { RuleBuilder },
      template: `
      <rule-builder :filter.sync="filter" @update:filter="spy" :fields="fields">
      </rule-builder>
    `
    });

    const select = wrapper.find('[data-test="addGroup"]');

    select.trigger("click");

    const { field, operation, value } = spy.mock.calls[0][0].rules[0].rules[0];

    expect({ field, operation, value }).toEqual({
      field: null,
      operation: null,
      value: null
    });
  });

  test("updating filter prop updates normalizedFilter", async () => {
    const wrapper = mount({
      data() {
        return {
          fields,
          filter: {
            all: true,
            rules: []
          }
        };
      },
      components: { RuleBuilder },
      template: `
      <rule-builder :filter="filter" :fields="fields">
      </rule-builder>
    `
    });
    wrapper.vm.filter = {
      id: "root",
      all: true,
      rules: [
        {
          id: 1,
          field: null,
          operation: null,
          value: null
        }
      ]
    };

    await Vue.nextTick();

    const expected = wrapper.vm.$children[0].$children[0].filter;
    const actual = {
      all: true,
      id: "root",
      rules: [{ field: null, id: 1, operation: null, value: null }]
    };

    expect(expected).toEqual(actual);
  });

  test("setting a field", () => {
    const spy = jest.fn();

    const wrapper = mount({
      data() {
        return {
          fields,
          filter: {
            all: true,
            rules: [
              {
                field: null,
                operation: null,
                value: null
              }
            ]
          }
        };
      },
      methods: {
        spy
      },
      components: { RuleBuilder },
      template: `
      <rule-builder :filter="filter" @update:filter="spy" :fields="fields">
      </rule-builder>
    `
    });

    const select = wrapper.find('[data-test="fieldSelector"]');

    select.element.value = "ID";

    select.trigger("change");

    const { field, operation, value } = spy.mock.calls[0][0].rules[0];

    expect({ field, operation, value }).toEqual({
      field: "ID",
      operation: null,
      value: null
    });

    wrapper.find('[data-test="operationSelector"]');
  });

  test("setting a field will show operations", () => {
    const wrapper = mount({
      data() {
        return {
          fields: [
            {
              name: "ID",
              label: "ID",
              operations: [["Is", "equals"]],
              type: "number"
            },
            {
              name: "this_fiscal_year",
              label: "This Fiscal Year"
            }
          ],
          filter: {
            all: true,
            rules: [
              {
                field: "ID",
                operation: null,
                value: null
              }
            ]
          }
        };
      },
      components: { RuleBuilder },
      template: `
      <rule-builder :filter="filter" :fields="fields">
      </rule-builder>
    `
    });

    wrapper.find('[data-test="operationSelector"]')
  })
test("setting a field will show operations", () => {
    const wrapper = mount({
      data() {
        return {
          fields: [
            {
              name: "ID",
              label: "ID",
              operations: [["Is", "equals"]],
              type: "number"
            },
            {
              name: "this_fiscal_year",
              label: "This Fiscal Year"
            }
          ],
          filter: {
            all: true,
            rules: [
              {
                field: "ID",
                operation: null,
                value: null
              }
            ]
          }
        };
      },
      components: { RuleBuilder },
      template: `
      <rule-builder :filter="filter" :fields="fields">
      </rule-builder>
    `
    });

    expect(wrapper.findAll('[data-test="operationSelector"]').length).toBe(1)
  })

  test("setting a field will not operations if none defined", () => {
    const wrapper = mount({
      data() {
        return {
          fields: [
            {
              name: "ID",
              label: "ID",
              operations: [["Is", "equals"]],
              type: "number"
            },
            {
              name: "this_fiscal_year",
              label: "This Fiscal Year"
            }
          ],
          filter: {
            all: true,
            rules: [
              {
                field: "this_fiscal_year",
                operation: null,
                value: null
              }
            ]
          }
        };
      },
      components: { RuleBuilder },
      template: `
      <rule-builder :filter="filter" :fields="fields">
      </rule-builder>
    `
    });

    expect(wrapper.findAll('[data-test="operationSelector"]').length).toBe(0)
  })

  test("setting a filterable field shows sub filter", () => {
    const spy = jest.fn();

    const wrapper = mount({
      data() {
        return {
          fields,
          filter: {
            all: true,
            rules: [
              {
                field: null,
                operation: null,
                value: null
              }
            ]
          }
        };
      },
      methods: {
        spy
      },
      components: { RuleBuilder },
      template: `
      <rule-builder :filter.sync="filter" :fields="fields">
      </rule-builder>
    `
    });

    const select = wrapper.find('[data-test="fieldSelector"]');

    select
      .findAll("option")
      .at(2)
      .trigger("change");

    expect(wrapper.findAll('[data-test="fieldFilter"]').length).toBe(1);
  });

  test("setting an operation", () => {
    const spy = jest.fn();

    const wrapper = mount({
      data() {
        return {
          fields,
          filter: {
            all: true,
            rules: [
              {
                field: "ID",
                operation: null,
                value: null
              }
            ]
          }
        };
      },
      methods: {
        spy
      },
      components: { RuleBuilder },
      template: `
      <rule-builder :filter="filter" @update:filter="spy" :fields="fields">
      </rule-builder>
    `
    });

    const select = wrapper.find('[data-test="operationSelector"]');

    select
      .findAll("option")
      .at(1)
      .trigger("change");

    const { field, operation, value } = spy.mock.calls[0][0].rules[0];

    expect({ field, operation, value }).toEqual({
      field: "ID",
      operation: "equals",
      value: null
    });

    expect(wrapper.findAll('[data-test="valueSetter"]').length).toBe(1);
  });

  test("remove a rule", () => {
    const spy = jest.fn();

    const wrapper = mount({
      data() {
        return {
          fields,
          filter: {
            all: true,
            rules: [
              {
                field: "ID",
                operation: null,
                value: null
              },
              {
                field: "ID",
                operation: null,
                value: null
              }
            ]
          }
        };
      },
      methods: {
        spy
      },
      components: { RuleBuilder },
      template: `
      <rule-builder :filter="filter" @update:filter="spy" :fields="fields">
      </rule-builder>
    `
    });

    const button = wrapper.find('[data-test="removeRule"]');

    button.trigger("click");

    const expected = spy.mock.calls[0][0].rules.map(
      ({ field, operation, value }) => ({ field, operation, value })
    );
    expect(expected).toEqual([
      {
        field: "ID",
        operation: null,
        value: null
      }
    ]);
  });

  test("remove a nested rule", () => {
    const spy = jest.fn();

    const wrapper = mount({
      data() {
        return {
          fields,
          filter: {
            all: true,
            rules: [
              {
                all: true,
                rules: [
                  {
                    field: "ID",
                    operation: null,
                    value: null
                  }
                ]
              }
            ]
          }
        };
      },
      methods: {
        spy
      },
      components: { RuleBuilder },
      template: `
      <rule-builder :filter="filter" @update:filter="spy" :fields="fields">
      </rule-builder>
    `
    });

    const button = wrapper.find('[data-test="removeRule"]');

    button.trigger("click");

    const expected = spy.mock.calls[0][0].rules[0].rules.length;
    expect(expected).toEqual(0);
  });

  test("remove a filter rule", () => {
    const spy = jest.fn();

    const wrapper = mount({
      data() {
        return {
          fields,
          filter: {
            all: true,
            rules: [
              {
                field: "totalPayments",
                filter: {
                  all: true,
                  rules: [
                    {
                      field: "department"
                    }
                  ]
                }
              }
            ]
          }
        };
      },
      methods: {
        spy
      },
      components: { RuleBuilder },
      template: `
      <rule-builder :filter="filter" @update:filter="spy" :fields="fields">
      </rule-builder>
    `
    });

    const button = wrapper.find('[data-test="removeRule"]');
    button.trigger("click");

    const expected = spy.mock.calls[0][0].rules[0].filter.rules.length;
    expect(expected).toEqual(0);
  });

  test("remove a filter group", () => {
    const spy = jest.fn();

    const wrapper = mount({
      data() {
        return {
          fields,
          filter: {
            all: true,
            rules: [
              {
                all: true,
                rules: [
                  {
                    field: null,
                    operation: null,
                    value: null
                  }
                ]
              }
            ]
          }
        };
      },
      methods: {
        spy
      },
      components: { RuleBuilder },
      template: `
      <rule-builder :filter="filter" @update:filter="spy" :fields="fields">
      </rule-builder>
    `
    });

    const button = wrapper.find('[data-test="removeGroup"]');
    button.trigger("click");

    const expected = spy.mock.calls[0][0].rules.length;
    expect(expected).toEqual(0);
  });
});
