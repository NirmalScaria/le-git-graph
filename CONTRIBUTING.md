# Welcome to Le Git Graph contributing guide <!-- omit in toc -->

Thank you for investing your time in contributing to our project! Any contribution you make will be reflected on Chrome Web Store and Firefox Addons Hub :sparkles:. 

Read our [Code of Conduct](./CODE_OF_CONDUCT.md) to keep our community approachable and respectable.

In this guide you will get an overview of the contribution workflow from opening an issue, creating a PR, reviewing, and merging the PR.

## New contributor guide

To get an overview of the project, read the [README](README.md). Here are some resources to help you get started with extension development:

- [Loading extension for development - Chrome](https://developer.chrome.com/docs/extensions/mv3/getstarted/development-basics/#load-unpacked)
- [Loading extension for development - Firefox](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Your_first_WebExtension#installing)
- [Manifest V3](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [GitHub OAuth](https://docs.github.com/en/developers/apps/building-oauth-apps/authorizing-oauth-apps)
- [GitHub GraphQL API](https://docs.github.com/en/graphql)


## Getting started

Extension installed via Chrome Web Store or Firefox AddOns Hub are mostly meant for end user consumption. For development, the extension is to be loaded in a different way. To start with, go ahead with the following steps:
1. Uninstall or disable Le Git Graph if already installed via Chrome Web Store or Firefox AddOns Hub.
2. Fork this repository.
3. Clone the forked repository. ([How?](https://docs.github.com/en/repositories/creating-and-managing-repositories/cloning-a-repository))
4. Load the extension from the cloned repository. Follow [these steps](https://developer.chrome.com/docs/extensions/mv3/getstarted/development-basics/#load-unpacked) for Chrome and [these steps](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Your_first_WebExtension#installing) for Firefox.
5. Make changes in the source code and refresh the extension inside the browser to see changes.

### Issues

#### Create a new issue

If you spot a problem with Le Git Graph, [search if an issue already exists](https://docs.github.com/en/github/searching-for-information-on-github/searching-on-github/searching-issues-and-pull-requests#search-by-the-title-body-or-comments). If a related issue doesn't exist, you can open a new issue using a relevant [issue form](https://github.com/NirmalScaria/le-git-graph/issues/new/choose). 

#### Solve an issue

Scan through our [existing issues](https://github.com/NirmalScaria/le-git-graph/issues) to find one that interests you. You can narrow down the search using `labels` as filters. As a general rule, issues are usually not assigned to anyone. If you find an issue to work on, you are welcome to open a PR with a fix.

### Make Changes

#### Developer documentation

Developer documentation provides an idea on how the extension is working currently. It is strongly suggested to have a brief look at the documentation before proceeding to actively work on the source code as it will help your work be a lot smoother.

#### Bug fixes

This project is not following unit tests (at least yet). Kindly make sure the fixes are stable by testing with relevant testcases depending on the change you worked on.

### Commit your update

Commit the changes once you are happy with them.

### Pull Request

When you're finished with the changes, commit it, push it, and create a pull request, also known as a PR.
- Don't forget to [link PR to issue](https://docs.github.com/en/issues/tracking-your-work-with-issues/linking-a-pull-request-to-an-issue) if you are solving one.
- Enable the checkbox to [allow maintainer edits](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/allowing-changes-to-a-pull-request-branch-created-from-a-fork) so the branch can be updated for a merge.
Once you submit your PR, your proposal will be reviewed. There might be questions or requests for additional information.
- You maybe asked for changes to be made before a PR can be merged, either using [suggested changes](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/incorporating-feedback-in-your-pull-request) or pull request comments. You can apply suggested changes directly through the UI. You can make any other changes in your fork, then commit them to your branch.
- If you run into any merge issues, checkout this [git tutorial](https://github.com/skills/resolve-merge-conflicts) to help you resolve merge conflicts and other issues.

### Your PR is merged!

Congratulations :tada::tada: Big Thanks to you :sparkles:. 

Once your PR is merged, your contributions will be publicly visible with the next version release. 
