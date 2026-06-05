interface ProjectGroupFinishAgreementKey {
	projectGroupId: number;
	userId: number;
}

const finishAgreementStorageKey = "team-po.project-group-finish-agreements";

export function hasStoredProjectGroupFinishAgreement(
	key: ProjectGroupFinishAgreementKey,
) {
	return readAgreementKeys().has(createAgreementKey(key));
}

export function storeProjectGroupFinishAgreement(
	key: ProjectGroupFinishAgreementKey,
) {
	if (typeof window === "undefined") {
		return;
	}

	const agreementKeys = readAgreementKeys();
	agreementKeys.add(createAgreementKey(key));
	window.localStorage.setItem(
		finishAgreementStorageKey,
		JSON.stringify([...agreementKeys]),
	);
}

function readAgreementKeys() {
	if (typeof window === "undefined") {
		return new Set<string>();
	}

	const rawValue = window.localStorage.getItem(finishAgreementStorageKey);

	if (!rawValue) {
		return new Set<string>();
	}

	try {
		const parsedValue = JSON.parse(rawValue) as unknown;

		if (!Array.isArray(parsedValue)) {
			return new Set<string>();
		}

		return new Set(
			parsedValue.filter((value): value is string => typeof value === "string"),
		);
	} catch {
		window.localStorage.removeItem(finishAgreementStorageKey);
		return new Set<string>();
	}
}

function createAgreementKey({
	projectGroupId,
	userId,
}: ProjectGroupFinishAgreementKey) {
	return `${projectGroupId}:${userId}`;
}
