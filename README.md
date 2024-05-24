# Philips Backstage Plugins

This repository is a collection of Philips plugins for Backstage. It is a community-driven repository where Philips developers can contribute their plugins to be shared with the rest of the community.

## Repository layout

This repository is formed by a set of workspaces. A workspace holds a plugin or a set of plugins based on a specific topic. For example, catalog, kubernetes, and TechDocs can be referred to as workspaces.
Each plugin belongs to a workspace and workspaces are portable enough to be moved to its own repo if desired.

## Release Management

Changesets have proven to be a reliable method for managing different versions of packages.
Each plugin workspace has its own changesets and isolated releases. Plugins that depend on other plugins via regular NPM dependencies, regardless of whether the other plugins are core plugins, other plugins within the community repo, or external plugins.
Although the community repository isn't technically a "yarn workspace", it functions as a repository with multiple sub yarn workspaces, with each workspace possessing its unique .changesets directory.

Whenever a new changeset is introduced, a fresh "Version packages ($workspace_name)" PR is produced. Merging a Version packages PR will trigger the release of all the plugins in the workspaces (provided changesets have been added), and also update the `CHANGELOG` files.

## How to create a new workspace

```bash
$ yarn create-workspace
```
