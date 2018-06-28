import * as uuid from "uuid";
import * as N from "normalizr";
import omitDeep from "omit-deep-lodash";
import without from "lodash/without";
import omit from "lodash/omit";

export function addIDs(filter, parent) {
  const id = parent ? uuid.v4() : "root";

  if ("all" in filter) {
    return {
      all: filter.all,
      id,
      rules: filter.rules.map(x => addIDs(x, id))
    };
  }

  const rule = filter;

  return {
    id: uuid.v4(),
    ...rule,
    ...(rule.filter ? { filter: addIDs(rule.filter, id) } : {})
  };
}

export function stripIDs(filter) {
  return omitDeep(filter, "id");
}

const Filter = new N.schema.Entity("filters");

const Rule = new N.schema.Entity("rules", {
  filter: Filter
});

const FilterOrRule = new N.schema.Union(
  {
    filters: Filter,
    rules: Rule
  },
  value => ("all" in value ? "filters" : "rules")
);

Filter.define({
  rules: [FilterOrRule]
});

export function normalize(filter) {
  const { filters, rules } = N.normalize(filter, Filter).entities;

  return {
    ...Object.values(filters).reduce(
      (filters, filter) => ({
        ...filters,
        [filter.id]: {
          ...filter,
          rules: filter.rules.map(x => x.id)
        }
      }),
      {}
    ),
    ...rules
  };
}

export function denormalize(normalized) {
  const isRule = filter => "field" in filter;

  const entities = Object.values(normalized).reduce(
    (entities, filter) => ({
      rules: {
        ...entities.rules,
        ...(isRule(filter)
          ? {
              [filter.id]: filter
            }
          : {})
      },
      filters: {
        ...entities.filters,
        ...(!isRule(filter)
          ? {
              [filter.id]: {
                ...filter,
                rules: filter.rules.map(id => ({
                  id,
                  schema: isRule(normalized[id]) ? "rules" : "filters"
                }))
              }
            }
          : {})
      }
    }),
    {
      filters: {},
      rules: {}
    }
  );

  return N.denormalize(entities.filters.root, Filter, entities);
}

export function removeRule(normalized, parent, rule) {
  if (!rule) {
    return omit(normalized, parent);
  }

  return {
    ...normalized,
    [parent]: {
      ...normalized[parent],
      rules: without(normalized[parent].rules, rule)
    }
  };
}

export function addFilter(normalized, parent) {
  const filter = {
    id: uuid.v4(),
    all: true,
    rules: []
  };

  if ("all" in normalized[parent])
    return addRule(
      {
        ...normalized,
        [parent]: {
          ...normalized[parent],
          rules: [...normalized[parent].rules, filter.id]
        },
        [filter.id]: filter
      },
      filter.id
    );

  return {
    ...normalized,
    [parent]: {
      ...normalized[parent],
      filter: filter.id
    },
    [filter.id]: filter
  };
}

export function addRule(normalized, parent) {
  const rule = {
    id: uuid.v4(),
    field: null,
    operation: null,
    value: null
  };

  return {
    ...normalized,
    [parent]: {
      ...normalized[parent],
      rules: [...normalized[parent].rules, rule.id]
    },
    [rule.id]: rule
  };
}
