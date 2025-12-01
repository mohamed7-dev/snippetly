import { DeleteAccountSettings } from './delete-account-settings'
import { EmailSettings } from './email-settings'
import { MainContentHeader } from './main-content-header'
import { PasswordSettings } from './password-settings'

export function SecurityPage() {
  return (
    <div className="flex flex-col gap-6">
      <MainContentHeader />
      <EmailSettings />
      <PasswordSettings />
      <DeleteAccountSettings />
    </div>
  )
}
