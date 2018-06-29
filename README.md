# What is this?
This component can be used whenever you need a UI for created complex filters. The UI is used to build up a data structure which can be used to generate a query of some sort.

A rule consists of three fields, a name, operation and value
`{ name: 'firstName', operation: 'startsWith', value: 'B' }`

The name and operation are arbitrary values, and you would have to have a parser which understands what those mean.

Rules can be put in a group:
`{ all: true, rules: [] }`

Rules can be filtered further:
```
{
name: 'totalPayments',
filter: {
	all: true,
	rules: [
	]
}
```

The basic component can takes two props, `filter` and `fields`. `filter` is a rule group, and fields is an array of `field`s. A `field` looks like:
`{
name: 'firstName',
label: 'First Name',
operations: [["Starts With", "startWith"]]
}`

The component will emit `update:filter` so you can use the `.sync` modifier.

The component comes with a built in UI, and there is a stylesheet which can be included as well, to get the default look and feel. Alternatively, a scoped slot can be provided instead, for the ultimate in flexibility.

Check out the storybook which demonstrates usage. 
