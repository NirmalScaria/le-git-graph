## Le Git Graph - Commits Graph for GitHub

<img src = "https://drive.google.com/uc?export=download&id=12bnQqy4cm2vQcZSKWo2INBv-69iqkF_p" width = "150">

A browser extension that displays the git graph for any GitHub repository.

[![Version](https://img.shields.io/badge/License-MIT-yellow)]()
[![Version](https://img.shields.io/badge/Version-1.3.6-yellowgreen)]()
[![Version](https://img.shields.io/badge/Chrome_CI/CD-Success-green)]()
[![Version](https://img.shields.io/badge/Firefox_CI/CD-Success-green)]()

## Demo
![Demo Image](https://user-images.githubusercontent.com/46727865/218700103-c26082db-a696-435c-934c-cc66e1c067bd.png)



## Installation

Install the extension from the link -

For Google Chrome, Opera, Vivaldi, Brave, and Microsoft Edge:

[https://chrome.google.com/webstore/detail/le-git-graph-commits-grap/joggkdfebigddmaagckekihhfncdobff](https://chrome.google.com/webstore/detail/le-git-graph-commits-grap/joggkdfebigddmaagckekihhfncdobff)

For Mozilla Firefox:

[https://addons.mozilla.org/firefox/addon/le-git-graph-github-git-graph/](https://addons.mozilla.org/firefox/addon/le-git-graph-github-git-graph/)


After installation, open any GitHub repository and a new 'Commits' tab will be visible.

Open the commits tab and follow the prompt to authenticate with your GitHub account.

## Why does it need write access

The extension asks for permission in the level
`repo - read and write`

Le Git Graph requires only read access to public or private repositories.

The reason is only because there is no `repo - read only` access level supported by Github OAuth. 
(You can read the discussion here https://github.com/orgs/community/discussions/7891 )

Even though access is requested for read and write, the extension only uses it for read operations, as you can see in the source code.

## Setup for Private Repos owned by an Organization

Access to private repositories owned by an organization is restricted by default. To access the commits graph for such repositories, you need to follow the following steps.

1. Go to [https://github.com/settings/tokens](https://github.com/settings/tokens) 
2. Create a Personal Access Token (PAT)  with the following scopes -
    - repo |  Full control of private repositories
  > For a more secure option, use a Fine-Grained token (beta) with the following scopes - 
  > - repo |  Read access to code, commit statuses, and metadata
3. Go back to the commits tab of a repo owned by the organization.
4. From the dropdown for "Authorize with GitHub", select "Custom Personal Access Token".
5. Enter the PAT and click on "Add PAT".

(Full access to repo is required to fetch the commits graph, because there is no read only access level for GitHub OAuth scopes as of now.)

## Tech Stack

**Client:** JavaScript, Manifest V3

**Server:** GitHub GraphQL, GitHub OAuth, FireBase Cloud Functions


## Features

- Authentication with GitHub OAuth  ✓
- Connection to GitHub GraphQL ✓
- Fetch the commits data from API ✓
- Fetch further commits on demand ✓
- Option to specify access level (public only or private too) ✓
- Hover on the commit dot to see details ✓
- Option to add custom PAT ✓
- Filter the commits based on branch - Pending

## Contact

Feel free to drop a mail at scaria@scaria.dev or nirmalscaria1@gmail.com
