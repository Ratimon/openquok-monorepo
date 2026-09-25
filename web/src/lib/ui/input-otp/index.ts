/** Input OTP primitives (Root, Group, Slot, Separator) plus RecoveryCodeInput for auth recovery codes. */
import Group from './input-otp-group.svelte';
import Root from './input-otp.svelte';
import RecoveryCodeInput from './recovery-code-input.svelte';
import Separator from './input-otp-separator.svelte';
import Slot from './input-otp-slot.svelte';

export {
	Root,
	Group,
	Slot,
	Separator,
	RecoveryCodeInput,
	Root as InputOTP,
	Group as InputOTPGroup,
	Slot as InputOTPSlot,
	Separator as InputOTPSeparator
};
