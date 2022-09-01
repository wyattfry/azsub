#!/usr/bin/env node

import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { Subscription, selectSub, setDefaultSub } from './subscription.js'
import { getProfilePath, readAzureProfile } from './profile.js'

async function main () {
  const description = 'Azure CLI Subscription Switcher'
  const argv = yargs(hideBin(process.argv))
    .usage(description)
    .option('profile', {
      describe: 'path to your azureProfile.json',
      type: 'string',
      default: getProfilePath(),
      alias: 'p',
      nargs: 1,
      normalize: true
    })
    .argv
  const azureProfile = await readAzureProfile(argv.profile)
  const subs = azureProfile.subscriptions.map(x => new Subscription(x))
  const selectedSub = await selectSub(subs)
  setDefaultSub(azureProfile, selectedSub)
  console.log('Active subscription set to', selectedSub)
}

main()
  .then()
  .catch(err => console.error(err))
