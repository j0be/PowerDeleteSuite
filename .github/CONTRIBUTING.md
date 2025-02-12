# CONTRIBUTING

---

---

# Desired Contributions

---

We welcome any improvements to PowerDeleteSuite's [README.md](http://README.md) documentation. A more comprehensive guide would greatly benefit users.

For additional contribution opportunities, please check out the [issues](https://github.com/j0be/PowerDeleteSuite/issues) page.

---

---

# Code Standards

---

## Code Conventions

### Naming

All variables and functions must be named in camelCase format.

- Example: `checkBookmarkletVersion`, `applyStyles`, `handleSingle` .

Variables and functions must be descriptive and self-documenting whenever possible.

### White Space, Indentation & Comments

*White Space*: 

- No trailing whitespace at the end of lines.
- One blank line should exist between functions as well as between logical sections of code within functions.
- There should be spaces:
    - After commas in lists.
    - Around operators (e.g. `+`, `-`, `*`, `/`, `=`, `>`, `<`, …).
    - After keywords (e.g. `if`, `else`, `for`, …).
    - Padding content inside of curly braces `{ <content> }` .

*Indentation*: This project uses two spaces for indentation.

*Comments*:

- Every file must begin with a comment block matching the one below outlining the licensing information of the project.
    
    ```
    /*
     * This file is part of j0be/PowerDeleteSuite.
     *
     * j0be/PowerDeleteSuite is free software: you can redistribute it and/or modify
     * it under the terms of the GNU General Public License as published by
     * the Free Software Foundation, either version 2 of the License, or
     * (at your option) any later version.
     *
     * j0be/PowerDeleteSuite is distributed in the hope that it will be useful,
     * but WITHOUT ANY WARRANTY; without even the implied warranty of
     * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
     * GNU General Public License for more details.
     *
     * You should have received a copy of the GNU General Public License version 2
     * along with j0be/PowerDeleteSuite.  If not, see <http://www.gnu.org/licenses/>.
     */
    ```
    
- If your code fails to be self-documenting, please utilize general comments in a Documentation Block Comment. Read more [here](https://jsdoc.app/about-getting-started) if you are not familiar.

### String Literals

Single quotes are to be used when deliminating string literals.

### Error Handling

All contributions must implement robust error handling using try-catch blocks or similar mechanisms. Specifically, code should catch and handle exceptions for network requests, file operations, and data parsing to prevent application crashes.

### Linters

This project would benefit from implementing [ESLint](https://eslint.org/) to ensure consistent code style across all contributions. These tools can automatically enforce our coding standards and conventions.

Contributors should run ESLint before submitting pull requests to maintain code quality.

---

---

# Workflow

---

## Forking

**Please do not fork this project.** 

Contributions should be achieved through branches set for deletion upon merge approval/denial.

---

## Branching 

Branch names shall be prefixed with their applicable tag:

- `feature/` for new features.
- `issue<#>/` for addressing issues with the corresponding number of the issue being addressed (see below).
    
    Example: `issue74/<your-branch-name>` .
    See exampleOfIssueNumber.png for reference.
    
- `generic/` for maintenance tasks and updates (refactoring for example).
- `documentation/` for changes to the documentation.
    - Please ensure all of these changes reside in the `.github` directory.

Creating your branch:

- Clone the repository.
- Run this command when you have navigated to your local project’s directory:
    
    ```bash
    git checkout -b <branch-name>
    ```
    
- Ensure that any commits are pushed only into your branch by using this command:
    
    ```bash
    git push origin -u origin <your-branch-name>
    ```
    
    - This ensures your local branch has a remote tracking branch of the same name referring to an upstream branch in your remote repository.
    - This avoids pushing all matching branches.

Synchronizing your Branch:

- When creating your branch, make sure you are branching from the master. This ensures that your work is based on the last stable version of the code.
- To ensure your project is up-to-date with the latest changes in the master, please regularly sync your branch (every time you begin work again) in order to avoid wasted time. 
To sync your branch run this command after you have navigated to your local project’s directory:
    
    ```bash
    git fetch origin 
    ```
    

---

## Commits

### Commit Message Guidelines

*Title***:** Brevity is appreciated here; be descriptive but be brief.

*Content*: Please add at least two sentences describing your changes if they are not immediately evident or self-explanatory.

*Footer*: The last section of your commit should address any issues this change addresses.

### Template

```
<Title>
<Content>
<Footer>
```

```
Added Licensing, CLA & Contribution Guidelines
Created a directory to house github files named .github. 
Created a CLA for all potential contributors to sign prior to pull requests.
Added the GPLv2 License to the project and all project files.
Closes issue #46
```

### Frequency

Push to your branch at the end of every working period. j0be/PowerDeleteSuite is not responsible for any lost, uncommitted code due to user error.

---

## Pull Requests

### Pull Request Message Guidelines

Follow the guidelines present for commit messages (above).

### How to Submit a Pull Request

To submit a pull request, navigate to your branch within the repository (refer to image.png).

Once you have pushed your changes, click on where it says “This branch is <#> commits ahead of….” (refer to image 1.png).

If your branch is behind the master, it is your responsibility to sync your repository *BEFORE* submitting a pull request. Difficult merges will not be the responsibility of j0be or any subsidiaries.

Next, double check your branch is merging into the master, and click “Create pull request” (refer to image 2.png).

Ensure your title and content are consistent with the message guidelines above, and “Create pull request” (refer to image 3.png).

---

## Code Review

We welcome your contributions to j0be/PowerDeleteSuite.

By adhering to guidelines, your pull requests are more likely to be properly reviewed and integrated into the project.

### Reviewer

The Reviewer checks the code to make sure it satisfactorily adheres to the guidelines established above and tests the code for functionality and bugs.

### Requirements

*Code Conventions*: Including entity naming, white space, indentation, comments, strings, error handling, and the use of ESLint as outlined above.

*Workflow*: Including forking, branching, committing, and creating pull requests, as outlined above.

### Anticipated Response time

We intend to review and respond to all pull requests but sometimes, life gets in the way. 

Here, we like to go with the flow and get there when we get there.

---

---

# Community Guidelines

---

## Code of Conduct

Refer to the [Contribution License Agreement](/.github/CLA)

---

## Communication Platforms

[r/PowerDeleteSuite](https://www.reddit.com/r/PowerDeleteSuite/)

---

---

# Licensing

---

### License

j0be/PowerDeleteSuite is licensed under the GNU General Public License v2.0 (GPL-2.0).

See the [LICENSE](https://www.notion.so/CONTRIBUTING-197f5e03d29880e3bf8ce4e247406ed7?pvs=21) file for more details.

---

### Contributor License Agreement (CLA)

The CLA can be found [here](/.github/CLA). Please fill out your information prior to creating a pull request.

---

---

Author: forma-cristata