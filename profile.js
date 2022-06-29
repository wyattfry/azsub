import fs from 'fs/promises'
import path from 'path'

export function getProfilePath () {
  const userHome = process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME']
  return path.join(userHome, '.azure', 'azureProfile.json')
}

export async function readAzureProfile (profile) {
  const profilePath = profile || getProfilePath()
  let profBytes
  try {
    profBytes = await fs.readFile(profilePath)
  } catch (ex) {
    console.error('Could not find', profilePath, '-- have you installed the azure-cli tool and run `az login`?')
    process.exit(1)
  }

  // The file starts with three non-utf-8 bytes that cause the json parse to
  // fail. The following filters them out:
  const filtered = profBytes.filter(x => x < 128)
  const asString = Buffer.from(filtered, 'utf-8').toString()
  try {
    const profileObject = JSON.parse(asString)
    if (!profileObject.subscriptions || profileObject.subscriptions.length === 0) {
      console.error('No Azure subscriptions found in', profilePath, '\nTry running `az login` then try again.')
      process.exit(1)
    }
    return profileObject
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.error('Error:', profilePath, 'exists, but it is not valid JSON.')
    } else {
      console.error('An error has occurred while trying to read', profilePath)
    }
    process.exit(1)
  }
}
