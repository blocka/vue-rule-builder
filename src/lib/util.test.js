import {
  addIDs,
  normalize,
  denormalize,
  stripIDs,
  removeRule,
  addRule,
  addFilter
} from "./util";

jest.mock("uuid", () => {
  return {
    v4: jest.fn()
  };
});

import { v4 } from "uuid";

describe("utilities", () => {
  test("addIDs", () => {
    let count = 1;
    v4.mockImplementation(() => {
      return count++;
    });
    const filter = {
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
    };

    const actual = addIDs(filter);

    expect(actual.id).toBe("root");

    expect(actual.rules[0].id).toBe(2);

    expect(actual.rules[0].filter.id).toBe(3);

    expect(actual.rules[0].filter.rules[0].id).toBe(5);
  });

  test("normalize", () => {
    const filter = {
      all: true,
      id: "root",
      rules: [
        {
          id: 1,
          field: "totalPayments",
          filter: {
            id: 2,
            all: true,
            rules: [
              {
                id: 3,
                field: "department"
              }
            ]
          }
        },
        {
          id: 4,
          all: true,
          rules: [
            {
              id: 5,
              field: null,
              operation: null,
              value: null
            }
          ]
        }
      ]
    };

    const actual = normalize(filter);
    const expected = {
      root: {
        id: "root",
        all: true,
        rules: [1, 4]
      },
      1: {
        id: 1,
        field: "totalPayments",
        filter: 2
      },
      2: {
        id: 2,
        all: true,
        rules: [3]
      },
      3: {
        id: 3,
        field: "department"
      },
      4: {
        id: 4,
        all: true,
        rules: [5]
      },
      5: {
        id: 5,
        field: null,
        operation: null,
        value: null
      }
    };

    expect(actual).toEqual(expected);
  });

  test("denormalize", () => {
    const normalized = {
      root: {
        id: "root",
        all: true,
        rules: [1, 6, 7]
      },
      1: {
        id: 1,
        field: "totalPayments",
        filter: 2
      },
      2: {
        id: 2,
        all: true,
        rules: [3]
      },
      3: {
        id: 3,
        field: "department"
      },
      6: {
        id: 6,
        field: null,
        operation: null,
        value: null
      },
      7: {
        id: 7,
        all: true,
        rules: [8]
      },
      8: {
        id: 8,
        field: null,
        operation: null,
        value: null
      }
    };

    const expected = {
      all: true,
      id: "root",
      rules: [
        {
          id: 1,
          field: "totalPayments",
          filter: {
            id: 2,
            all: true,
            rules: [
              {
                id: 3,
                field: "department"
              }
            ]
          }
        },
        {
          id: 6,
          field: null,
          operation: null,
          value: null
        },
        {
          id: 7,
          all: true,
          rules: [
            {
              id: 8,
              field: null,
              operation: null,
              value: null
            }
          ]
        }
      ]
    };

    const actual = denormalize(normalized);

    expect(actual).toEqual(expected);
  });

  test("stripIDs", () => {
    const filter = {
      all: true,
      id: "root",
      rules: [
        {
          id: 1,
          field: "totalPayments",
          filter: {
            id: 2,
            all: true,
            rules: [
              {
                id: 3,
                field: "department"
              }
            ]
          }
        }
      ]
    };

    const expected = {
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
    };

    const actual = stripIDs(filter);

    expect(actual).toEqual(expected);
  });

  describe("adding and removing rules", () => {
    const normalized = {
      root: {
        id: "root",
        all: true,
        rules: [1]
      },
      1: {
        id: 1,
        field: "totalPayments",
        filter: 2
      },
      2: {
        id: 2,
        all: true,
        rules: [3]
      },
      3: {
        id: 3,
        field: "department"
      }
    };
    test("add rule", () => {
      let count = 5;
      v4.mockImplementation(() => {
        return count++;
      });

      const expected = {
        root: {
          id: "root",
          all: true,
          rules: [1, 5]
        },
        1: {
          id: 1,
          field: "totalPayments",
          filter: 2
        },
        2: {
          id: 2,
          all: true,
          rules: [3]
        },
        3: {
          id: 3,
          field: "department"
        },
        5: {
          id: 5,
          field: null,
          operation: null,
          value: null
        }
      };

      const actual = addRule(normalized, "root");

      expect(actual).toEqual(expected);
    });

    test("add group", () => {
      let count = 5;
      v4.mockImplementation(() => {
        return count++;
      });
      const expected = {
        root: {
          id: "root",
          all: true,
          rules: [1, 5]
        },
        1: {
          id: 1,
          field: "totalPayments",
          filter: 2
        },
        2: {
          id: 2,
          all: true,
          rules: [3]
        },
        3: {
          id: 3,
          field: "department"
        },
        5: {
          id: 5,
          all: true,
          rules: [6]
        },
        6: {
          id: 6,
          field: null,
          operation: null,
          value: null
        }
      };

      const actual = addFilter(normalized, "root");

      expect(actual).toEqual(expected);
    });

    test("add filter to rule", () => {
      let count = 5;
      v4.mockImplementation(() => {
        return count++;
      });

      const expected = {
        root: {
          id: "root",
          all: true,
          rules: [1]
        },
        1: {
          id: 1,
          field: "totalPayments",
          filter: 2
        },
        2: {
          id: 2,
          all: true,
          rules: [3]
        },
        3: {
          id: 3,
          field: "department",
          filter: 5
        },
        5: {
          id: 5,
          all: true,
          rules: []
        }
      };
      const actual = addFilter(normalized, 3);

      expect(actual).toEqual(expected);
    });

    test("remove rule", () => {
      const expected = {
        all: true,
        id: "root",
        rules: [
          {
            id: 1,
            field: "totalPayments",
            filter: {
              id: 2,
              all: true,
              rules: []
            }
          }
        ]
      };

      const actual = denormalize(removeRule(normalized, 2, 3));

      expect(actual).toEqual(expected);
    });
    test("remove filter", () => {
      const expected = {
        all: true,
        id: "root",
        rules: [
          {
            id: 1,
            field: "totalPayments"
          }
        ]
      };

      const actual = denormalize(removeRule(normalized, 2));

      expect(actual).toEqual(expected);
    });
  });
});
