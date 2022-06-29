#!/usr/bin/env node

import fs from 'fs/promises'
import fuzzy from 'fuzzy'
import path from 'path'
import inquirer from 'inquirer'
import inquirerPrompt from 'inquirer-autocomplete-prompt'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

class Subscription {
  constructor (x) {
    this.id = x.id
    this.name = x.name
    this.isDefault = x.isDefault
  }
}

function getProfilePath () {
  const userHome = process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME']
  return path.join(userHome, '.azure', 'azureProfile.json')
}

function setDefaultSub (azureProfile, defaultSubName) {
  azureProfile.subscriptions = azureProfile.subscriptions.map(x => {
    x.isDefault = x.name === defaultSubName
    return x
  })
  fs.writeFile(`${getProfilePath()}`, JSON.stringify(azureProfile))
}

function searchSubscriptions (answers, input = '') {
  return new Promise((resolve) => {
    setTimeout(() => {
      readAzureProfileJson().then(profile => {
        resolve(fuzzy.filter(input, profile.subscriptions.map(x => x.name)).map((el) => el.original))
      })
        .catch(err => console.error(err))
    }, Math.random() * 470 + 30)
  })
}

/**
 *
 * @param {*} subsArray an string array of subscription names
 * @returns string Name of the selected subscription
 */
async function selectSub (subsArray) {
  inquirer.registerPrompt('autocomplete', inquirerPrompt)
  const answers = await inquirer
    .prompt([
      {
        type: 'autocomplete',
        name: 'subscription',
        message: 'Which Azure Subscription to set as current',
        loop: false,
        pageSize: 20,
        source: searchSubscriptions
      }
    ])

  return answers.subscription
}

async function readAzureProfileJson (profile) {
  const profilePath = !!profile ? profile : getProfilePath()
  let profBytes = undefined
  try {
    profBytes = await fs.readFile(profilePath)
  } catch (ex) {
    console.error('Could not find', profilePath, '-- have you install the azure-cli tool and run `az login`?', ex)
    process.exit(1)
  }

  // The file starts with three non-utf-8 bytes that cause the json parse to
  // fail. The following filters them out:
  const filtered = profBytes.filter(x => x < 128)
  const asString = Buffer.from(filtered, 'utf-8').toString()
  const profileObject = JSON.parse(asString)
  if (!profileObject.subscriptions || profileObject.subscriptions.length === 0) {
    console.error('No Azure subscriptions found in', profilePath, '\nTry running `az login` then try again.')
    process.exit(1)
  }
  return profileObject
}

async function main () {
  const { description } = JSON.parse(await fs.readFile('package.json', 'utf8'))
  const argv = yargs(hideBin(process.argv))
    .usage(description)
    .option('profile', {
      describe: "path to your azureProfile.json",
      type: 'string',
      default: getProfilePath(),
      alias: "p",
      nargs: 1,
      normalize: true,
    })
    .argv
  const azureProfile = await readAzureProfileJson(argv.profile)
  const subs = azureProfile.subscriptions.map(x => new Subscription(x))
  const selectedSub = await selectSub(subs)
  setDefaultSub(azureProfile, selectedSub)
  console.log('Active subscription set to', selectedSub)
}

main()
  .then()
  .catch(err => console.error(err))

