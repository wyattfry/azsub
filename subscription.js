import fs from 'fs/promises'
import fuzzy from 'fuzzy'
import inquirer from 'inquirer'
import inquirerPrompt from 'inquirer-autocomplete-prompt'
import { getProfilePath, readAzureProfile } from './profile.js'

export class Subscription {
  constructor (x) {
    this.id = x.id
    this.name = x.name
    this.isDefault = x.isDefault
  }
}

export function setDefaultSub (azureProfile, defaultSubName) {
  azureProfile.subscriptions = azureProfile.subscriptions.map(x => {
    x.isDefault = x.name === defaultSubName
    return x
  })
  fs.writeFile(`${getProfilePath()}`, JSON.stringify(azureProfile))
}

export function searchSubscriptions (answers, input = '') {
  return new Promise((resolve) => {
    setTimeout(() => {
      readAzureProfile().then(profile => {
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
export async function selectSub (subsArray) {
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
