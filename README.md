# azsub - Azure CLI Subscription Switcher

This is a command-line application meant for direct user interaction.

A nodejs module to make switching your active (default) Azure Subscription when using the Azure CLI tool. It is similar to kubectx, but instead of switching k8s contexts, it's Azure subscriptions.

It is an alternative to the Azure CLI's built-in way of switching subscriptions:

```shell
az account set --subscription <sub_name|sub_id>
```

It's really not that bad, especially if you have azure cli completion installed, but this program just makes it one step easier.

## Installation

It may be installed globally from the npm repository:

```shell
npm install -g azsub
```

Or from github:

```shell
npm install -g https://github.com/wyattfry/azsub
```


## Usage

Invoking the command will present you with a list of subscriptions you have access to. You can choose one either with the up/down arrow keys, or by typing part of its name (it will perform fuzzy finding).

```shell
❯ az login
❯ azsub
? Which Azure Subscription to set as current (Use arrow keys or type to search)
❯ Personal Projects 
  Cool Client 
  Trial Subscription1 
  Arduous App - Development 
  Arduous App - Sandbox 
  Arduous App - Production
...
Active subscription set to Arduous App - Sandbox
❯ az account show -o tsv --query name
Arduous App - Sandbox
```