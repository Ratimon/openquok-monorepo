export enum ActionVerificationModalStatus {
	UNKNOWN = 'unknown',
	SUBMITTING = 'submitting',
	SUBMITTED = 'submitted'
}

export interface ExecutionFnProgrammerModel {
	success: boolean;
	message: string;
}

export class ActionVerificationModalPresenter {
	private executionFunction: (data: unknown) => Promise<ExecutionFnProgrammerModel> = () =>
		Promise.reject(new Error('Execution function not initialized'));

	public status: ActionVerificationModalStatus = $state(ActionVerificationModalStatus.UNKNOWN);
	public showToastMessage: boolean = $state(false);
	public toastMessage: string = $state('');

	constructor(executionFunction: (data: unknown) => Promise<ExecutionFnProgrammerModel>) {
		this.executionFunction = executionFunction;
		this.execute = this.execute.bind(this);
	}

	public execute = async (data: unknown): Promise<ExecutionFnProgrammerModel> => {
		this.status = ActionVerificationModalStatus.SUBMITTING;
		const resultPm = await this.executionFunction(data);

		if (resultPm.success) {
			this.showToastMessage = true;
			this.toastMessage = resultPm.message;
			this.status = ActionVerificationModalStatus.SUBMITTED;
		} else {
			this.showToastMessage = true;
			this.toastMessage = resultPm.message;
			this.status = ActionVerificationModalStatus.UNKNOWN;
		}
		return resultPm;
	};
}
