# plugin-github-action-marketplace

Welcome to the plugin-github-action-marketplace plugin!
This plugin creates a new catalog page that filters on the component type `github-action`.
The plugin exposes a new React component called `MarketplacePage` that will show
the catalog entries in a card view. Clicking on an entry will forward you to
the catalog entry. On the catalog page, you can make use of two new components:

- `EntityGitHubActionInstallationCard`, this component will showcase how to
  install the GitHub Action. It is presented in a Codeblock, with easy to use
  one-click copy functionality.
- `EntityGitHubActionUsageCard`, this component will make it easy for others to
  find examples in your organization on how the Action is being used.

You can add this page to your entities page by using the `componentType` selector in the `EntitySwitch` like

```react
<EntitySwitch>
    ....
    <EntitySwitch.Case if={isComponentType('github-action')}>
      {MarketplacePage}
    </EntitySwitch.Case>
</EntitySwitch>
```
